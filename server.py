"""KisanMandi — Python server (same API as server.ts), for quick testing.

Run (Windows / Termux / Replit):
    pip install flask
    python server.py            -> http://localhost:3000

What it does
  * /api/...  : listings, users, wallet, reviews, mandi rates (stored in data/database.json)
  * everything else: serves the built app from the  dist/  folder (created by `npm run build`).
    If dist/ does not exist yet it shows a short help page instead.
"""
import json
import os
import threading
import time
from datetime import datetime, timedelta, timezone

from flask import Flask, jsonify, request, send_from_directory

BASE = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.environ.get("KM_DB", os.path.join(BASE, "data", "database.json"))
RATES_FILE = os.path.join(BASE, "data", "mandi_rates.json")
DIST = os.path.join(BASE, "dist")
PORT = int(os.environ.get("PORT", 3000))
# Payment mode:  "demo" = approval is simulated after a few seconds (for testing only, no real money)
#                "easypaisa" / "jazzcash" = real gateway (needs merchant credentials, see provider_* below)
PAYMENT_MODE = os.environ.get("KM_PAYMENT_MODE", "demo").lower()
DEPOSIT_AMOUNT = 100
METHODS = {"EasyPaisa", "JazzCash", "Bank Transfer / Raast"}

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024
lock = threading.Lock()


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


EMPTY_DB = {
    "listings": [], "users": [], "transactions": [], "reviews": [],
    "financials": {
        "totalRevenueFromFees": 0, "totalRevenueFromFeaturedAds": 0, "totalWalletDeposits": 0,
        "totalActiveWalletsBalance": 0, "contactUnlockFee": 10, "featuredAdFee": 50,
        "minDepositAmount": 100, "maxDepositAmount": 100,
        "receiverEasyPaisaAccount": "", "receiverAccountTitle": "KisanMandi",
        "gatewayProvider": "Daraz-Style Automated Direct Gateway",
    },
}


def load_db():
    if not os.path.exists(DB_FILE):  # no data folder yet -> start with an empty database
        print("NOTE: data/database.json not found - starting empty. Copy the data folder next to server.py for sample ads.")
        os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(EMPTY_DB, f, ensure_ascii=False, indent=2)
    with open(DB_FILE, encoding="utf-8") as f:
        db = json.load(f)
    db.setdefault("reviews", [])
    db.setdefault("payments", [])
    return db


def save_db():
    tmp = DB_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
    os.replace(tmp, DB_FILE)  # atomic: a crash can't leave a half-written file


db = load_db()
_seq = [0]


def new_id(prefix):
    _seq[0] += 1
    return f"{prefix}_{int(time.time() * 1000)}{_seq[0]}"


def clean(phone):
    return "".join((phone or "").split())


def find(items, item_id):
    return next((x for x in items if x.get("id") == item_id), None)


def err(msg, code=400):
    return jsonify({"error": msg}), code


@app.after_request
def cors(r):
    r.headers["Access-Control-Allow-Origin"] = "*"
    r.headers["Access-Control-Allow-Headers"] = "Content-Type"
    r.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return r


@app.route("/api/<path:_>", methods=["OPTIONS"])
def options(_):
    return "", 204


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "KisanMandi Python Server", "timestamp": now_iso()})


# ------------------------------------------------------------------ listings
@app.get("/api/listings")
def listings():
    return jsonify(db["listings"])


@app.post("/api/listings")
def add_listing():
    data = request.get_json(silent=True) or {}
    with lock:
        listing = {**data, "id": new_id("listing"), "createdAt": now_iso(), "viewsCount": 1,
                   "contactsUnlockedCount": 0, "status": "active"}
        db["listings"].insert(0, listing)
        save_db()
    return jsonify(listing), 201


@app.put("/api/listings/<lid>/status")
def listing_status(lid):
    data = request.get_json(silent=True) or {}
    with lock:
        l = find(db["listings"], lid)
        if not l:
            return err("Listing not found", 404)
        l["status"] = data.get("status", l["status"])
        if data.get("blockReason"):
            l["blockReason"] = data["blockReason"]
        save_db()
    return jsonify(l)


@app.delete("/api/listings/<lid>")
def delete_listing(lid):
    with lock:
        db["listings"] = [l for l in db["listings"] if l["id"] != lid]
        save_db()
    return jsonify({"success": True})


# --------------------------------------------------------------------- users
@app.get("/api/users")
def users():
    return jsonify(db["users"])


@app.post("/api/users")
def upsert_user():
    data = request.get_json(silent=True) or {}
    phone = clean(data.get("phone"))
    with lock:
        existing = next((u for u in db["users"] if clean(u["phone"]) == phone), None)
        if existing:
            # profile / referral fields only; money, role and unlocks are changed by the wallet routes
            for k, v in data.items():
                if k not in ("id", "role", "walletBalance", "unlockedListingIds", "phone"):
                    existing[k] = v
            save_db()
            return jsonify(existing)
        user = {
            "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            "referralCode": f"KM-{phone[-4:]}",
            "referralCredits": 0,
            "totalReferralsCount": 0,
            **data,
            "id": data.get("id") or new_id("user"),
            "name": data.get("name") or f"Trader {phone[-4:]}",
            "phone": phone,
            "city": data.get("city") or "Faisalabad",
            "area": data.get("area") or "Grain Market",
            "role": "user",
            "walletBalance": 100,  # welcome balance
            "unlockedListingIds": [],
            "status": "active",
            "registeredAt": data.get("registeredAt") or now_iso(),
        }
        db["users"].append(user)
        save_db()
    return jsonify(user), 201


# ----------------------------------------------------------------- financials
@app.get("/api/financials")
def financials():
    return jsonify(db["financials"])


def add_tx(**kw):
    tx = {"id": new_id("tx"), "timestamp": now_iso(), "status": "completed", **kw}
    db["transactions"].insert(0, tx)
    return tx


@app.post("/api/wallet/deposit")
def deposit():
    # The browser must never be able to add money to a wallet by itself.
    return err("Use /api/payments/start. Wallet credit happens only after payment is confirmed.", 403)


# ------------------------------------------------------------------ payments
class GatewayNotReady(Exception):
    pass


def provider_start(p):
    """Ask the gateway to send the approval request to the customer's phone."""
    if PAYMENT_MODE == "demo":
        p["approveAt"] = time.time() + 6  # simulated approval
        return
    # TODO (needs merchant credentials + the gateway's official API document):
    #   easypaisa -> Easypaisa merchant "mobile account" transaction (customer gets a prompt on the phone)
    #   jazzcash  -> JazzCash mobile-wallet transaction (customer approves in the JazzCash app / USSD)
    #   card      -> redirect to the gateway's hosted card page (never collect card numbers ourselves)
    # Read the keys from environment variables, call the API here, save the gateway's reference in
    # p["providerRef"], and raise GatewayNotReady until all of that is done.
    raise GatewayNotReady("Online payment is not enabled yet.")


def provider_status(p):
    """Return 'pending' | 'completed' | 'failed'. Only the gateway's answer may complete a payment."""
    if PAYMENT_MODE == "demo":
        return "completed" if time.time() >= p.get("approveAt", 0) else "pending"
    return "pending"  # TODO: ask the gateway (or handle its callback) using p["providerRef"]


def complete_payment(p):
    """Credit the wallet exactly once (idempotent)."""
    if p["status"] != "pending":
        return
    user = find(db["users"], p["userId"])
    p["status"] = "completed"
    p["completedAt"] = now_iso()
    p["referenceId"] = p.get("referenceId") or f"{p['method'][:2].upper()}-{int(time.time())}"
    if user:
        user["walletBalance"] += p["amount"]
        db["financials"]["totalWalletDeposits"] += p["amount"]
        db["financials"]["totalActiveWalletsBalance"] += p["amount"]
        add_tx(userId=user["id"], userName=user["name"], type="deposit", amount=p["amount"],
               method=p["method"], referenceId=p["referenceId"],
               note=f"Rs. {p['amount']} deposit via {p['method']}")
    save_db()


def public_payment(p):
    return {"paymentId": p["id"], "status": p["status"], "amount": p["amount"],
            "method": p["method"], "referenceId": p.get("referenceId"),
            "message": p.get("message"), "testMode": PAYMENT_MODE == "demo"}


@app.post("/api/payments/start")
def payment_start():
    d = request.get_json(silent=True) or {}
    phone = clean(d.get("phone"))
    with lock:
        user = find(db["users"], d.get("userId"))
        if not user:
            return err("User account not found", 404)
        if d.get("method") not in METHODS:
            return err("Choose a payment method")
        if not (phone.isdigit() and 10 <= len(phone) <= 13):
            return err("Enter a valid mobile account number")
        p = {"id": new_id("pay"), "userId": user["id"], "phone": phone, "method": d["method"],
             "amount": DEPOSIT_AMOUNT,  # amount is fixed by the server, not the browser
             "status": "pending", "createdAt": now_iso()}
        try:
            provider_start(p)
        except GatewayNotReady as e:
            return err(str(e), 501)
        db["payments"].append(p)
        save_db()
    return jsonify(public_payment(p)), 201


@app.get("/api/payments/<pid>")
def payment_status(pid):
    with lock:
        p = find(db["payments"], pid)
        if not p:
            return err("Payment not found", 404)
        if p["status"] == "pending":
            result = provider_status(p)
            if result == "completed":
                complete_payment(p)
            elif result == "failed":
                p["status"] = "failed"
                save_db()
        return jsonify(public_payment(p))


@app.post("/api/wallet/unlock-contact")
def unlock_contact():
    d = request.get_json(silent=True) or {}
    with lock:
        user = find(db["users"], d.get("userId"))
        listing = find(db["listings"], d.get("listingId"))
        if not user:
            return err("User not found", 404)
        if not listing:
            return err("Listing not found", 404)
        user.setdefault("unlockedListingIds", [])
        if listing["id"] in user["unlockedListingIds"]:
            return jsonify({"success": True, "message": "Already unlocked"})
        fee = db["financials"].get("contactUnlockFee", 10)
        if user["walletBalance"] < fee:
            return err(f"Insufficient wallet balance. You need Rs. {fee}")
        user["walletBalance"] -= fee
        user["unlockedListingIds"].append(listing["id"])
        listing["contactsUnlockedCount"] = listing.get("contactsUnlockedCount", 0) + 1
        db["financials"]["totalRevenueFromFees"] += fee
        db["financials"]["totalActiveWalletsBalance"] -= fee
        tx = add_tx(userId=user["id"], userName=user["name"], type="contact_unlock_fee", amount=-fee,
                    method="System Wallet", listingId=listing["id"], listingTitle=listing["title"],
                    sellerId=listing["sellerId"], sellerName=listing["sellerName"],
                    note=f'Rs. {fee} contact fee for "{listing["title"]}"')
        save_db()
    return jsonify({"success": True, "user": user, "listing": listing, "transaction": tx,
                    "financials": db["financials"]})


@app.post("/api/wallet/unlock-contact-referral")
def unlock_referral():
    d = request.get_json(silent=True) or {}
    with lock:
        user = find(db["users"], d.get("userId"))
        listing = find(db["listings"], d.get("listingId"))
        if not user:
            return err("User not found", 404)
        if not listing:
            return err("Listing not found", 404)
        user.setdefault("unlockedListingIds", [])
        if listing["id"] in user["unlockedListingIds"]:
            return jsonify({"success": True, "message": "Already unlocked"})
        if user.get("referralCredits", 0) < 1:
            return err("No referral credits available.")
        user["referralCredits"] -= 1
        user["unlockedListingIds"].append(listing["id"])
        listing["contactsUnlockedCount"] = listing.get("contactsUnlockedCount", 0) + 1
        tx = add_tx(userId=user["id"], userName=user["name"], type="contact_unlock_fee", amount=0,
                    method="Referral Credit", listingId=listing["id"], listingTitle=listing["title"],
                    sellerId=listing["sellerId"], sellerName=listing["sellerName"],
                    note=f'1 free referral unlock used for "{listing["title"]}"')
        save_db()
    return jsonify({"success": True, "user": user, "listing": listing, "transaction": tx})


@app.post("/api/listings/<lid>/upgrade-featured")
def upgrade_featured(lid):
    d = request.get_json(silent=True) or {}
    with lock:
        listing = find(db["listings"], lid)
        user = find(db["users"], d.get("userId"))
        if not listing:
            return err("Listing not found", 404)
        if not user:
            return err("User not found", 404)
        fee = db["financials"].get("featuredAdFee", 50)
        if user["walletBalance"] < fee:
            return err(f"Insufficient wallet balance. You need Rs. {fee} to feature this ad.")
        user["walletBalance"] -= fee
        listing["isFeatured"] = True
        listing["featuredUntil"] = (datetime.now(timezone.utc) + timedelta(days=14)).strftime("%Y-%m-%dT%H:%M:%S.000Z")
        db["financials"]["totalRevenueFromFeaturedAds"] = db["financials"].get("totalRevenueFromFeaturedAds", 0) + fee
        db["financials"]["totalActiveWalletsBalance"] -= fee
        tx = add_tx(userId=user["id"], userName=user["name"], type="featured_ad_fee", amount=-fee,
                    method="System Wallet", listingId=listing["id"], listingTitle=listing["title"],
                    sellerId=listing["sellerId"], sellerName=listing["sellerName"],
                    note=f"Rs. {fee} featured ad fee")
        save_db()
    return jsonify({"success": True, "user": user, "listing": listing, "transaction": tx,
                    "financials": db["financials"]})


# ------------------------------------------------------------ reviews / misc
@app.get("/api/reviews")
def reviews():
    return jsonify(db["reviews"])


@app.post("/api/reviews")
def add_review():
    d = request.get_json(silent=True) or {}
    with lock:
        review = {**d, "id": new_id("rev"), "createdAt": now_iso()}
        db["reviews"].insert(0, review)
        mine = [r for r in db["reviews"] if r.get("sellerId") == d.get("sellerId")]
        avg = round(sum(float(r.get("rating") or 5) for r in mine) / len(mine), 1)
        for l in db["listings"]:
            if l.get("sellerId") == d.get("sellerId"):
                l["sellerRating"], l["reviewsCount"] = avg, len(mine)
        save_db()
    return jsonify({"review": review, "avgRating": avg, "reviewsCount": len(mine)}), 201


@app.get("/api/transactions")
def transactions():
    return jsonify(db["transactions"])


@app.get("/api/mandi-rates")
def mandi_rates():
    if not os.path.exists(RATES_FILE):
        return jsonify([])
    with open(RATES_FILE, encoding="utf-8") as f:
        return jsonify(json.load(f))


# ------------------------------------------------------------ the app itself
HELP = """<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<body style="font-family:sans-serif;max-width:560px;margin:40px auto;padding:0 16px;line-height:1.6">
<h2>KisanMandi server is running ✅</h2>
<p>The API works (try <a href="/api/listings">/api/listings</a>), but the app screens are not built yet:
the <code>dist/</code> folder is missing.</p>
<p>Build it once with <code>npm install</code> then <code>npm run build</code> (on a computer, Replit,
or GitHub Actions), put the <code>dist</code> folder next to <code>server.py</code>, and refresh.</p></body>"""


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def spa(path):
    if not os.path.isdir(DIST):
        return HELP
    full = os.path.join(DIST, path)
    if path and os.path.isfile(full):
        return send_from_directory(DIST, path)
    return send_from_directory(DIST, "index.html")


if __name__ == "__main__":
    print(f"KisanMandi Python server: http://localhost:{PORT}")
    if PAYMENT_MODE == "demo":
        print("PAYMENT MODE: demo (simulated approval, no real money). Set KM_PAYMENT_MODE for a real gateway.")
    app.run(host="0.0.0.0", port=PORT, debug=False)
