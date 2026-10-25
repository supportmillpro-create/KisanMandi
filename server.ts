import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_LISTINGS, INITIAL_USERS, INITIAL_TRANSACTIONS, INITIAL_FINANCIALS } from './src/data/seedData.js';
import { LIVE_MANDI_RATES_DATA } from './src/data/mandiRatesData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Persistent Cloud Database File Path
const DB_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DB_DIR, 'database.json');

// Ensure database directory & seed data exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function loadDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      listings: INITIAL_LISTINGS,
      users: INITIAL_USERS,
      transactions: INITIAL_TRANSACTIONS,
      financials: {
        ...INITIAL_FINANCIALS,
        receiverEasyPaisaAccount: '03428046383',
        receiverAccountTitle: 'KisanMandi Official Settlement',
        gatewayProvider: 'Daraz-Style Automated Direct Gateway',
      },
      reviews: [
        {
          id: 'rev_1',
          sellerId: 'user_1',
          sellerName: 'Chaudhry Tariq Mehmood',
          listingId: 'listing_1',
          reviewerId: 'user_2',
          reviewerName: 'Malik Zafar Iqbal',
          rating: 5,
          comment: 'Very honest trader! Rice moisture was exactly 10.5% as claimed. Super Kernel quality was genuine. Highly recommended.',
          createdAt: '2026-10-14T11:00:00Z',
        },
        {
          id: 'rev_2',
          sellerId: 'user_2',
          sellerName: 'Malik Zafar Iqbal',
          listingId: 'listing_2',
          reviewerId: 'user_4',
          reviewerName: 'Mian Bilal Rashid',
          rating: 5,
          comment: 'Desi Sharbati wheat quality is top notch. Clean winnowed grains, weight was exact on the bridge.',
          createdAt: '2026-10-15T09:30:00Z',
        },
        {
          id: 'rev_3',
          sellerId: 'user_3',
          sellerName: 'Haji Aslam Farooq',
          listingId: 'listing_4',
          reviewerId: 'user_1',
          reviewerName: 'Chaudhry Tariq Mehmood',
          rating: 4,
          comment: 'Good bold black chickpeas. Smooth transaction at Thal Mandi godown.',
          createdAt: '2026-10-15T15:20:00Z',
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.reviews) {
      parsed.reviews = [];
    }
    return parsed;
  } catch (err) {
    console.error('Error reading database file:', err);
    return {
      listings: INITIAL_LISTINGS,
      users: INITIAL_USERS,
      transactions: INITIAL_TRANSACTIONS,
      financials: INITIAL_FINANCIALS,
      reviews: []
    };
  }
}

function saveDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

// In-memory synced db cache
let db = loadDatabase();

// ==========================================
// REAL-TIME CLOUD API ROUTES
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'KisanMandi Cloud Server', timestamp: new Date().toISOString() });
});

// GET all listings (Real-time synchronization across all devices)
app.get('/api/listings', (req, res) => {
  res.json(db.listings);
});

// POST new listing (New ad appears instantly for all users)
app.post('/api/listings', (req, res) => {
  const listingData = req.body;
  const newListing = {
    ...listingData,
    id: `listing_${Date.now()}`,
    createdAt: new Date().toISOString(),
    viewsCount: 1,
    contactsUnlockedCount: 0,
    status: 'active',
  };
  db.listings.unshift(newListing);
  saveDatabase(db);
  res.status(201).json(newListing);
});

// UPDATE listing status (Active, Blocked, Sold)
app.put('/api/listings/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, blockReason } = req.body;
  const idx = db.listings.findIndex((l: any) => l.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  db.listings[idx].status = status;
  if (blockReason) db.listings[idx].blockReason = blockReason;
  saveDatabase(db);
  res.json(db.listings[idx]);
});

// DELETE listing
app.delete('/api/listings/:id', (req, res) => {
  const { id } = req.params;
  db.listings = db.listings.filter((l: any) => l.id !== id);
  saveDatabase(db);
  res.json({ success: true });
});

// GET users
app.get('/api/users', (req, res) => {
  res.json(db.users);
});

// REGISTER or UPDATE user
app.post('/api/users', (req, res) => {
  const userData = req.body || {};
  const cleanPhone = (userData.phone || '').trim().replace(/\s+/g, '');
  const existingIdx = db.users.findIndex((u: any) => u.phone.replace(/\s+/g, '') === cleanPhone);

  if (existingIdx !== -1) {
    // Profile / referral updates only. Wallet, role and unlocked list are changed
    // only by the server's own wallet routes, never overwritten from the browser.
    const { id, role, walletBalance, unlockedListingIds, phone, ...safe } = userData;
    db.users[existingIdx] = { ...db.users[existingIdx], ...safe };
    saveDatabase(db);
    return res.json(db.users[existingIdx]);
  }

  // New user: keep the SAME id the browser generated, otherwise the browser and
  // server disagree about who the user is (this caused logouts / failed unlocks).
  const newUser = {
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    referralCode: `KM-${cleanPhone.slice(-4)}`,
    referralCredits: 0,
    totalReferralsCount: 0,
    ...userData,
    id: userData.id || `user_${Date.now()}`,
    name: userData.name || `Trader ${cleanPhone.slice(-4)}`,
    phone: cleanPhone,
    city: userData.city || 'Faisalabad',
    area: userData.area || 'Grain Market',
    role: 'user',
    walletBalance: 100, // Complimentary welcome balance
    unlockedListingIds: [],
    status: 'active',
    registeredAt: userData.registeredAt || new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDatabase(db);
  res.status(201).json(newUser);
});

// GET Platform Financials (includes EasyPaisa receiver: 03428046383)
app.get('/api/financials', (req, res) => {
  res.json(db.financials);
});

// DARAZ-STYLE WALLET DEPOSIT (Auto-Debit PKR 100 routed to EasyPaisa 03428046383)
app.post('/api/wallet/deposit', (req, res) => {
  const { userId, amount, method, referenceId } = req.body;
  const user = db.users.find((u: any) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User account not found' });
  }

  const depositVal = Number(amount) || 100;
  user.walletBalance += depositVal;

  db.financials.totalWalletDeposits += depositVal;
  db.financials.totalActiveWalletsBalance += depositVal;

  const newTx = {
    id: `tx_${Date.now()}`,
    userId: user.id,
    userName: user.name,
    type: 'deposit',
    amount: depositVal,
    method: method || 'EasyPaisa Auto-Debit',
    referenceId: referenceId || `EP-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: 'completed',
    note: `Automated Daraz-style checkout deposit settled into EasyPaisa (${db.financials.receiverEasyPaisaAccount})`,
  };

  db.transactions.unshift(newTx);
  saveDatabase(db);

  res.json({ success: true, user, transaction: newTx, financials: db.financials });
});

// CONTACT REVEAL FEE (Deduct PKR 10 from buyer, credit to Admin Revenue)
app.post('/api/wallet/unlock-contact', (req, res) => {
  const { userId, listingId } = req.body;
  const user = db.users.find((u: any) => u.id === userId);
  const listing = db.listings.find((l: any) => l.id === listingId);

  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  if (user.unlockedListingIds?.includes(listingId)) {
    return res.json({ success: true, message: 'Already unlocked' });
  }

  const fee = db.financials.contactUnlockFee || 10;
  if (user.walletBalance < fee) {
    return res.status(400).json({ error: `Insufficient wallet balance. You need Rs. ${fee}` });
  }

  user.walletBalance -= fee;
  if (!user.unlockedListingIds) user.unlockedListingIds = [];
  user.unlockedListingIds.push(listingId);

  listing.contactsUnlockedCount = (listing.contactsUnlockedCount || 0) + 1;
  db.financials.totalRevenueFromFees += fee;
  db.financials.totalActiveWalletsBalance -= fee;

  const feeTx = {
    id: `tx_${Date.now()}`,
    userId: user.id,
    userName: user.name,
    type: 'contact_unlock_fee',
    amount: -fee,
    method: 'System Wallet',
    listingId: listing.id,
    listingTitle: listing.title,
    sellerId: listing.sellerId,
    sellerName: listing.sellerName,
    timestamp: new Date().toISOString(),
    status: 'completed',
    note: `Rs. 10 Contact fee paid for "${listing.title}"`,
  };

  db.transactions.unshift(feeTx);
  saveDatabase(db);

  res.json({ success: true, user, listing, transaction: feeTx, financials: db.financials });
});

// UNLOCK CONTACT WITH REFERRAL CREDIT (1 Free unlock per referral!)
app.post('/api/wallet/unlock-contact-referral', (req, res) => {
  const { userId, listingId } = req.body;
  const user = db.users.find((u: any) => u.id === userId);
  const listing = db.listings.find((l: any) => l.id === listingId);

  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  if (user.unlockedListingIds?.includes(listingId)) {
    return res.json({ success: true, message: 'Already unlocked' });
  }

  if ((user.referralCredits || 0) < 1) {
    return res.status(400).json({ error: 'No referral credits available.' });
  }

  user.referralCredits -= 1;
  if (!user.unlockedListingIds) user.unlockedListingIds = [];
  user.unlockedListingIds.push(listingId);
  listing.contactsUnlockedCount = (listing.contactsUnlockedCount || 0) + 1;

  const creditTx = {
    id: `tx_${Date.now()}`,
    userId: user.id,
    userName: user.name,
    type: 'contact_unlock_fee',
    amount: 0,
    method: 'Referral Credit',
    listingId: listing.id,
    listingTitle: listing.title,
    sellerId: listing.sellerId,
    sellerName: listing.sellerName,
    timestamp: new Date().toISOString(),
    status: 'completed',
    note: `1 Free Referral Unlock used for "${listing.title}"`,
  };

  db.transactions.unshift(creditTx);
  saveDatabase(db);

  res.json({ success: true, user, listing, transaction: creditTx });
});

// UPGRADE AD TO FEATURED / PREMIUM (Deduct Rs. 50 from seller, Pin to Top)
app.post('/api/listings/:id/upgrade-featured', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const listing = db.listings.find((l: any) => l.id === id);
  const user = db.users.find((u: any) => u.id === userId);

  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const fee = db.financials.featuredAdFee || 50;
  if (user.walletBalance < fee) {
    return res.status(400).json({ error: `Insufficient wallet balance. You need Rs. ${fee} to feature this ad.` });
  }

  user.walletBalance -= fee;
  listing.isFeatured = true;
  listing.featuredUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  db.financials.totalRevenueFromFeaturedAds = (db.financials.totalRevenueFromFeaturedAds || 0) + fee;
  db.financials.totalActiveWalletsBalance -= fee;

  const featTx = {
    id: `tx_${Date.now()}`,
    userId: user.id,
    userName: user.name,
    type: 'featured_ad_fee',
    amount: -fee,
    method: 'System Wallet',
    listingId: listing.id,
    listingTitle: listing.title,
    sellerId: listing.sellerId,
    sellerName: listing.sellerName,
    timestamp: new Date().toISOString(),
    status: 'completed',
    note: `Rs. 50 Featured Ad Fee paid. Listing pinned to TOP of KisanMandi like OLX.`,
  };

  db.transactions.unshift(featTx);
  saveDatabase(db);

  res.json({ success: true, user, listing, transaction: featTx, financials: db.financials });
});

// REVIEWS: GET all reviews
app.get('/api/reviews', (req, res) => {
  res.json(db.reviews || []);
});

// REVIEWS: POST new rating & review for seller
app.post('/api/reviews', (req, res) => {
  const reviewData = req.body;
  const newReview = {
    ...reviewData,
    id: `rev_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  if (!db.reviews) db.reviews = [];
  db.reviews.unshift(newReview);

  // Recalculate seller rating and review count
  const sellerReviews = db.reviews.filter((r: any) => r.sellerId === reviewData.sellerId);
  const avgRating = Number((sellerReviews.reduce((sum: number, r: any) => sum + Number(r.rating || 5), 0) / sellerReviews.length).toFixed(1));

  // Update seller's listings
  db.listings.forEach((l: any) => {
    if (l.sellerId === reviewData.sellerId) {
      l.sellerRating = avgRating;
      l.reviewsCount = sellerReviews.length;
    }
  });

  saveDatabase(db);
  res.status(201).json({ review: newReview, avgRating, reviewsCount: sellerReviews.length });
});

// GET transactions
app.get('/api/transactions', (req, res) => {
  res.json(db.transactions);
});

// GET Live Mandi Commodity Rates (Cotton, Wheat, Sugar, Maize, Rice, Pulses, Oilseeds)
app.get('/api/mandi-rates', (req, res) => {
  res.json(LIVE_MANDI_RATES_DATA);
});

// Download full project source code as ZIP file for developer
app.get('/api/download-source-zip', (req, res) => {
  const zipPath = path.resolve(__dirname, 'public', 'kisanmandi-source-code.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="kisanmandi-full-source-code.zip"');
    const filestream = fs.createReadStream(zipPath);
    filestream.pipe(res);
  } else {
    res.status(404).json({ error: 'Zip file not found' });
  }
});

// Start Express with Vite in dev, or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 KisanMandi Cloud Server running on port ${PORT}`);
    console.log(`📱 EasyPaisa Settlement Account: 03428046383`);
  });
}

startServer();
