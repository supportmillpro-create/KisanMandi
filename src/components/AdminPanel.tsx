import React, { useState } from 'react';
import { User, Listing, WalletTransaction, PlatformFinancials } from '../types';
import { 
  ShieldCheck, 
  Users, 
  DollarSign, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Search, 
  Trash2, 
  Lock, 
  Unlock, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Settings, 
  RefreshCw,
  Eye,
  SlidersHorizontal,
  BadgeDollarSign
} from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  listings: Listing[];
  transactions: WalletTransaction[];
  financials: PlatformFinancials;
  onUpdateListingStatus: (listingId: string, status: 'active' | 'blocked' | 'sold', reason?: string) => void;
  onDeleteListing: (listingId: string) => void;
  onToggleUserStatus: (userId: string, currentStatus: 'active' | 'banned') => void;
  onAdjustUserWallet: (userId: string, amount: number) => void;
  onResetData: () => void;
  onCloseAdmin: () => void;
  onSelectListing: (listing: Listing) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  listings,
  transactions,
  financials,
  onUpdateListingStatus,
  onDeleteListing,
  onToggleUserStatus,
  onAdjustUserWallet,
  onResetData,
  onCloseAdmin,
  onSelectListing,
}) => {
  const [activeTab, setActiveTab] = useState<'financials' | 'users' | 'moderation' | 'settings'>('financials');
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  const [blockReasonInput, setBlockReasonInput] = useState<{ [id: string]: string }>({});
  const [selectedListingForBlock, setSelectedListingForBlock] = useState<string | null>(null);

  // Financial calculations
  const unlockTransactions = transactions.filter((t) => t.type === 'contact_unlock_fee');
  const depositTransactions = transactions.filter((t) => t.type === 'deposit');

  const totalRevenue = financials.totalRevenueFromFees;
  const totalDeposits = financials.totalWalletDeposits;
  const totalUserBalances = users.reduce((acc, u) => acc + (u.walletBalance || 0), 0);

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone.includes(userSearch) ||
    u.city.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredListings = listings.filter((l) =>
    l.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
    l.city.toLowerCase().includes(listingSearch.toLowerCase()) ||
    l.sellerName.toLowerCase().includes(listingSearch.toLowerCase())
  );

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Admin Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 font-display">
                  KisanMandi Master Admin Panel
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  Supervisor Mode
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Full governance over platform revenue (Rs. 10 contact fees), user wallets, and crop ad moderation.
              </p>
            </div>
          </div>

          <button
            onClick={onCloseAdmin}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span>Exit to Public Marketplace</span>
          </button>
        </div>

        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Admin Earned Profit */}
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-3xl p-5 shadow-sm border border-emerald-900">
            <div className="flex items-center justify-between text-emerald-300 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Admin Revenue Earned</span>
              <BadgeDollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-white">
              Rs. {totalRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-300 mt-1">
              Direct income from <strong className="text-amber-300">{unlockTransactions.length} unlocked contacts</strong> (Rs. 10/each)
            </p>
          </div>

          {/* Total Wallets Inflow */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Total Deposits Inflow</span>
              <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-slate-900">
              Rs. {totalDeposits.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Via JazzCash, EasyPaisa & Raast (Rs. 100/deposit)
            </p>
          </div>

          {/* Active User Balance Liability */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Users Wallet Balance</span>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-slate-900">
              Rs. {totalUserBalances.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Held in {users.length} active registered trader accounts
            </p>
          </div>

          {/* Ads Status */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Crop Listings Status</span>
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-slate-900">
              {listings.filter((l) => l.status === 'active').length} Active
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {listings.filter((l) => l.status === 'blocked').length} Blocked for review • {listings.length} Total
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('financials')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'financials'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Financial Records & Fee Audit</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users Management ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'moderation'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Ad Moderation & Anti-Fraud ({listings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings & Controls</span>
          </button>
        </div>

        {/* TAB 1: FINANCIAL RECORDS */}
        {activeTab === 'financials' && (
          <div className="space-y-6">
            {/* Merchant Settlement Account Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-3xl p-6 shadow-md border border-emerald-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700/80 border border-emerald-500/40 text-amber-300 flex items-center justify-center font-bold text-base shadow-inner">
                  EP
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-300">
                      Active Merchant Settlement Node
                    </span>
                    <span className="text-[10px] font-bold bg-amber-400 text-emerald-950 px-2 py-0.2 rounded-full">
                      Linked & Live
                    </span>
                  </div>
                  <h3 className="text-lg font-black font-mono text-white mt-0.5">
                    EasyPaisa: {financials.receiverEasyPaisaAccount || '03428046383'}
                  </h3>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    All Daraz-style automated customer top-ups (Rs. 100) and revenue fees (Rs. 10) are settled into this account.
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-xs">
                <span className="text-emerald-300 block font-semibold text-[11px]">Customer Privacy Shield:</span>
                <span className="text-white font-medium">This number is encrypted and hidden from customers.</span>
              </div>
            </div>

            {/* Contact Fees Earned Table */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Rs. 10 Contact Reveal Fee Transactions (Admin Profit)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time ledger of every fee deducted when a buyer views a seller's phone and exact location.
                  </p>
                </div>
                <div className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl">
                  Total Collected: Rs. {totalRevenue}
                </div>
              </div>

              {unlockTransactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No contact fee transactions recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Date & Time</th>
                        <th className="py-2.5 px-3">Buyer (Payer)</th>
                        <th className="py-2.5 px-3">Crop Listing</th>
                        <th className="py-2.5 px-3">Seller Contacted</th>
                        <th className="py-2.5 px-3 text-right">Fee Deducted</th>
                        <th className="py-2.5 px-3 text-right">Admin Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {unlockTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                            {new Date(tx.timestamp).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {tx.userName}
                          </td>
                          <td className="py-3 px-3 text-slate-700 max-w-xs truncate" title={tx.listingTitle}>
                            {tx.listingTitle || 'Agricultural Produce'}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {tx.sellerName || 'Verified Seller'}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                            -Rs. 10
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-black text-emerald-700">
                            +Rs. 10
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Deposits Table */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span>User Wallet Deposits (JazzCash / EasyPaisa / Bank)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Record of Rs. 100 top-ups performed by buyers and traders.
                  </p>
                </div>
                <div className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-xl">
                  Total Deposits: Rs. {totalDeposits}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Payment Method</th>
                      <th className="py-2.5 px-3">TID Reference</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {depositTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(tx.timestamp).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {tx.userName}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.method === 'JazzCash' ? 'bg-red-100 text-red-800' : tx.method === 'EasyPaisa' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {tx.method || 'JazzCash'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {tx.referenceId || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                          +Rs. {tx.amount}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registered Traders & User Wallets
                </h3>
                <p className="text-xs text-slate-500">
                  Manage user profiles, view wallet balances, and regulate access.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user, mobile, city..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-100 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Trader / User</th>
                    <th className="py-2.5 px-3">Mobile Number</th>
                    <th className="py-2.5 px-3">City & Market</th>
                    <th className="py-2.5 px-3 text-right">Wallet Balance</th>
                    <th className="py-2.5 px-3 text-center">Unlocked Contacts</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[10px] text-slate-400">ID: {u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                        {u.phone}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {u.city}, {u.area}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Rs. {u.walletBalance}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {u.unlockedListingIds?.length || 0}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {u.status === 'active' ? 'Active' : 'Banned'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onAdjustUserWallet(u.id, 50)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px]"
                            title="Add Rs. 50 bonus"
                          >
                            +Rs. 50
                          </button>
                          <button
                            onClick={() => onToggleUserStatus(u.id, u.status)}
                            className={`px-2 py-1 rounded text-[10px] font-bold ${
                              u.status === 'active'
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'active' ? 'Ban' : 'Unban'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AD MODERATION */}
        {activeTab === 'moderation' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Crop Ads Moderation & Anti-Fraud Center
                </h3>
                <p className="text-xs text-slate-500">
                  Inspect ads, block fraudulent prices or fake produce photos, and keep market reliable.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter crop ads..."
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-100 rounded-xl text-xs outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className={`p-4 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    listing.status === 'blocked' ? 'bg-rose-50/60 border-rose-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200">
                          {listing.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          listing.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : listing.status === 'blocked'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}>
                          {listing.status.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-emerald-800">
                          Rs. {listing.price.toLocaleString()} {listing.priceUnit}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {listing.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Seller: <strong className="text-slate-800">{listing.sellerName}</strong> ({listing.sellerPhone}) • {listing.city}
                      </p>
                      {listing.blockReason && (
                        <p className="text-xs text-rose-700 font-semibold mt-1">
                          Reason: {listing.blockReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                    <button
                      onClick={() => onSelectListing(listing)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    {listing.status === 'active' ? (
                      <button
                        onClick={() => {
                          const reason = prompt('Enter reason for blocking this ad (e.g. Fraudulent price / Fake grain photo):', 'Suspicious commodity pricing');
                          if (reason !== null) {
                            onUpdateListingStatus(listing.id, 'blocked', reason);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Block Ad</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateListingStatus(listing.id, 'active')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Unblock Ad</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to permanently delete "${listing.title}"?`)) {
                          onDeleteListing(listing.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      title="Permanently Delete Ad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS & RESET */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-6 max-w-xl">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                System Rules & Monetization Settings
              </h3>
              <p className="text-xs text-slate-500">
                Parameters matching the project specification.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-800 block text-sm mb-1">
                  Contact Reveal Pay-Per-View Fee: Rs. 10
                </span>
                <p className="text-slate-500">
                  Fixed fee deducted from buyer's wallet and transferred to the administrator account when a seller's phone & address are unlocked.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-800 block text-sm mb-1">
                  Wallet Deposit Limit: Exactly Rs. 100
                </span>
                <p className="text-slate-500">
                  Standard batch top-up required via JazzCash, EasyPaisa, or Bank Raast transfer.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">Reset Database</h4>
                <p className="text-slate-500 mb-3">
                  Reset listings, transactions, and users back to pristine initial seed state.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Reset all KisanMandi marketplace data to default?')) {
                      onResetData();
                    }
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset All Marketplace Data</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
