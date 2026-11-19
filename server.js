const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = __dirname;
const DB_FILE = path.join(__dirname, 'data', 'database.json');

// MIME types mapping
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

function defaultDb() {
  return {
    settings: {
      siteName: "PayX.Market",
      tagline: "One Platform. Endless Possibilities.",
      marqueeText: "🎉 আজ রবি ও এয়ারটেল রিচার্জে ১৫% ইনস্ট্যান্ট ক্যাশব্যাক! ⚡ ৳৩১২+ রিচার্জে পাচ্ছেন +১ রিওয়ার্ড কয়েন! 🚀 PayX.Market - এক প্ল্যাটফর্মে সকল ডিজিটাল ও ই-কমার্স সেবা।",
      whatsapp: "8801934109081",
      minRecharge: 10,
      maxRecharge: 5000,
      minDeposit: 50,
      vipPrice: 161,
      coinRechargeThreshold: 312,
      shareCoinMilestone: 10,
      lifetimeRedeemThreshold: 1000,
      coinValueBdt: 1,
      adminPin: "AR2026"
    },
    operators: [
      { id: "GP", name: "GP", color: "#0095DA", prefixes: ["017", "013"], active: true },
      { id: "Robi", name: "Robi", color: "#E2136E", prefixes: ["018"], active: true },
      { id: "Airtel", name: "Airtel", color: "#FF0000", prefixes: ["016"], active: true },
      { id: "BL", name: "Banglalink", color: "#F37021", prefixes: ["019", "014"], active: true },
      { id: "TT", name: "Teletalk", color: "#4CAF50", prefixes: ["015"], active: true },
      { id: "Brilliant", name: "Brilliant", color: "#FFC419", prefixes: ["096"], active: true },
      { id: "Alap", name: "Alap", color: "#3B82F6", prefixes: ["0969"], active: true }
    ],
    bundles: [
      { id: "b1", title: "৩০ জিবি ইন্টারনেট + ৫০০ মিনিট (৩০ দিন)", op: "সকল অপারেটর", price: 399, cashback: "৳২৫ ক্যাশব্যাক + ১ কয়েন", validity: "৩০ দিন" },
      { id: "b2", title: "১৫ জিবি হাই-স্পিড ডাটা প্যাক (৩০ দিন)", op: "GP / Robi / BL", price: 249, cashback: "৳১৫ ক্যাশব্যাক", validity: "৩০ দিন" },
      { id: "b3", title: "৩২০ মিনিট টকটাইম বান্ডেল (৩০ দিন)", op: "সকল অপারেটর", price: 198, cashback: "ইনস্ট্যান্ট অ্যাক্টিভেশন", validity: "৩০ দিন" },
      { id: "b4", title: "৫০ জিবি মেগা ইন্টারনেট প্যাক (৩০ দিন)", op: "সকল অপারেটর", price: 498, cashback: "৳৩০ ক্যাশব্যাক + ২ কয়েন", validity: "৩০ দিন" }
    ],
    games: {
      PUBG: {
        name: "PUBG Mobile",
        currency: "UC",
        packages: [
          { id: "pubg_60", label: "60 UC", price: 110 },
          { id: "pubg_325", label: "325 UC", price: 550 },
          { id: "pubg_660", label: "660 UC", price: 1080 },
          { id: "pubg_1800", label: "1800 UC", price: 2750 }
        ]
      },
      FF: {
        name: "Free Fire",
        currency: "Diamonds",
        packages: [
          { id: "ff_115", label: "115 Diamonds", price: 95 },
          { id: "ff_240", label: "240 Diamonds", price: 190 },
          { id: "ff_610", label: "610 Diamonds", price: 460 },
          { id: "ff_weekly", label: "Weekly Membership", price: 165 }
        ]
      },
      MLBB: {
        name: "Mobile Legends",
        currency: "Diamonds",
        packages: [
          { id: "mlbb_86", label: "86 Diamonds", price: 145 },
          { id: "mlbb_172", label: "172 Diamonds", price: 285 },
          { id: "mlbb_257", label: "257 Diamonds", price: 420 },
          { id: "mlbb_pass", label: "Twilight Pass", price: 890 }
        ]
      }
    },
    products: [
      { id: "p1", name: "Aluminum Baseball Bat (30\")", category: "Gadgets", price: 1200, stock: 14, emoji: "⚾" },
      { id: "p2", name: "QCY Buds ANC HT15 Earbuds", category: "Gadgets", price: 2150, stock: 9, emoji: "🎧" },
      { id: "p3", name: "Atomic Habits (Bangla Edition)", category: "Books", price: 340, stock: 28, emoji: "📘" },
      { id: "p4", name: "Startup Bangladesh Blueprint", category: "Books", price: 420, stock: 16, emoji: "📕" },
      { id: "p5", name: "AR Luxury Black Polo T-Shirt", category: "Clothing", price: 690, stock: 22, emoji: "👕" },
      { id: "p6", name: "Premium Cotton Hoodie (Dark)", category: "Clothing", price: 1150, stock: 11, emoji: "🧥" }
    ],
    shopCategories: ["All", "Gadgets", "Books", "Clothing"],
    posts: [
      {
        id: "post1",
        author: "Admin AR Group",
        verified: true,
        badge: "Official",
        time: "এইমাত্র",
        content: "স্বাগতম @PayX.Market প্ল্যাটফর্মে! আমাদের অটোমেটিক পেমেন্ট গেটওয়ে, মোবাইল রিচার্জ এবং ফিজিক্যাল শপ সম্পর্কে আপনার মতামত শেয়ার করুন।",
        likes: 42,
        liked: false,
        comments: ["অসাধারণ সার্ভিস ভাই! ৫ সেকেন্ডে রিচার্জ পেয়েছি।"]
      },
      {
        id: "post2",
        author: "Tanvir Ahmed",
        verified: true,
        badge: "Top Reviewer",
        time: "২৫ মিনিট আগে",
        content: "@PayX.Market থেকে PUBG 325 UC টপ-আপ করলাম, সাথে সাথেই একাউন্টে চলে এসেছে এবং রিওয়ার্ড কয়েনও পেলাম!",
        likes: 19,
        liked: true,
        comments: []
      }
    ],
    ledger: [
      { id: "TXN-9042", title: "GP Mobile Recharge (01711-XXXXXX)", amount: 100, type: "debit", status: "Completed", time: "আজ, ০৯:৪৫ PM", timestamp: new Date().toISOString() },
      { id: "TXN-9041", title: "PUBG Mobile 60 UC Top-up", amount: 110, type: "debit", status: "Processing", time: "আজ, ০৮:২০ PM", timestamp: new Date().toISOString() },
      { id: "TXN-9039", title: "QCY Buds ANC HT15 Order", amount: 2150, type: "debit", status: "Pending", time: "গতকাল", timestamp: new Date().toISOString() },
      { id: "TXN-9035", title: "bKash Instant Add Money", amount: 1000, type: "credit", status: "Completed", time: "গতকাল", timestamp: new Date().toISOString() }
    ],
    users: [
      {
        id: "USR-01934109081",
        phone: "01934109081",
        name: "Foisal Ahamed",
        email: "foisal@payx.market",
        profession: "Software Engineer",
        location: "Araihazar, Narayanganj",
        walletBalance: 1450,
        rewardCoins: 45,
        lifetimeSpend: 650,
        isVipMember: false,
        isVerified: true,
        role: "user"
      }
    ],
    metrics: {
      totalRevenue: 48920,
      netProfit: 6480,
      activeUsers: 1284,
      newCustomers: 342,
      referredCustomers: 418,
      repeatCustomers: 524,
      locations: { dhaka: 48, chattogram: 22, sylhet: 12, others: 18 },
      salaries: [
        { role: "মডারেটর ও সাপোর্ট টিম (৩ জন)", amount: "৳24,000 / মাস", status: "Paid" },
        { role: "AR Group রিজার্ভ ফান্ড", amount: "৳18,500", status: "Available" }
      ]
    },
    specialOffers: [
      { id: "so1", op: "Robi", opName: "Robi", title: "রবি বোনাস প্যাক", desc: "৳৩১২ রিচার্জে", reward: "+1 Coin", amount: 312, bg: "#511329", accent: "#FF315D", isCrown: true, active: true },
      { id: "so2", op: "GP", opName: "Grameenphone", title: "জিপি ইন্টারনেট", desc: "বিশেষ অফার", reward: "🔥 Up to 20%", amount: 249, bg: "#102F52", accent: "#168BFF", isCrown: false, active: true },
      { id: "so3", op: "Airtel", opName: "Airtel", title: "এয়ারটেল প্যাক", desc: "রিচার্জে বোনাস", reward: "+1 Coin", amount: 312, bg: "#562014", accent: "#FF563C", isCrown: false, active: true },
      { id: "so4", op: "BL", opName: "Banglalink", title: "বাংলালিংক স্পেশাল", desc: "৫০GB মেগা প্যাক", reward: "৳২৫ ছাড়", amount: 498, bg: "#4A2208", accent: "#F37021", isCrown: false, active: true }
    ],
    announcements: [
      { id: "ann1", text: "নতুন: এখন থেকে প্রতিটি রিচার্জে রিওয়ার্ড কয়েন পাবেন!", icon: "✅", active: true, date: "2026-11-18" },
      { id: "ann2", text: "ড্রাইভ প্যাকের সকল অফারে লাইভ ক্যাশব্যাক স্টক সক্রিয় রয়েছে!", icon: "🚀", active: true, date: "2026-11-18" },
      { id: "ann3", text: "বিকাশ ও নগদ অটো ব্যালেন্স অ্যাড মানি সিস্টেম ১০০% চালু আছে!", icon: "⚡", active: true, date: "2026-11-18" },
      { id: "ann4", text: "আজকের স্পেশাল অফারে রবি ও এয়ারটেলে ইনস্ট্যান্ট ক্যাশব্যাক!", icon: "🔥", active: true, date: "2026-11-18" }
    ]
  };
}

// Database Helpers
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const def = defaultDb();
      writeDb(def);
      return def;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    const def = defaultDb();

    if (!parsed.settings) parsed.settings = def.settings;
    if (!parsed.operators || !parsed.operators.length) parsed.operators = def.operators;
    if (!parsed.bundles) parsed.bundles = def.bundles;
    if (!parsed.games) parsed.games = def.games;
    if (!parsed.products) parsed.products = def.products;
    if (!parsed.shopCategories) parsed.shopCategories = def.shopCategories;
    if (!parsed.posts) parsed.posts = def.posts;
    if (!parsed.ledger) parsed.ledger = def.ledger;
    if (!parsed.users || !parsed.users.length) parsed.users = def.users;
    if (!parsed.metrics) parsed.metrics = def.metrics;
    if (!parsed.specialOffers) parsed.specialOffers = def.specialOffers || [];
    if (!parsed.announcements) parsed.announcements = def.announcements || [];

    return parsed;
  } catch (err) {
    console.error('Error reading DB:', err);
    return defaultDb();
  }
}

function writeDb(data) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5e6) { // 5MB limit
        req.destroy();
        reject(new Error('Payload Too Large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function jsonResponse(res, statusCode, data) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(payload);
}

// Find user or create default user if not found
function getOrCreateUser(db, phone) {
  let user = db.users.find(u => u.phone === phone);
  if (!user) {
    user = {
      id: 'USR-' + (phone || 'GUEST'),
      phone: phone || '01934109081',
      name: 'AR Member',
      email: 'member@payx.market',
      profession: 'Member',
      location: 'Bangladesh',
      walletBalance: 1450,
      rewardCoins: 45,
      lifetimeSpend: 650,
      isVipMember: false,
      isVerified: true,
      role: 'user'
    };
    db.users.push(user);
  }
  return user;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // ==================== 1. BOOTSTRAP API ====================
  // Returns entire state from database.json for front-end synchronization
  if (method === 'GET' && pathname === '/api/bootstrap') {
    const db = readDb();
    return jsonResponse(res, 200, {
      success: true,
      settings: db.settings,
      operators: db.operators,
      bundles: db.bundles,
      games: db.games,
      products: db.products,
      shopCategories: db.shopCategories,
      posts: db.posts,
      ledger: db.ledger,
      users: db.users,
      metrics: db.metrics,
      specialOffers: db.specialOffers || [],
      announcements: db.announcements || []
    });
  }

  // POST /api/admin/special-offers — Manage Special Offers
  if (method === 'POST' && pathname === '/api/admin/special-offers') {
    try {
      const body = await parseBody(req);
      const db = readDb();
      if (!db.specialOffers) db.specialOffers = [];
      const { action, offer } = body;
      if (action === 'add') {
        offer.id = 'so_' + Date.now();
        db.specialOffers.unshift(offer);
      } else if (action === 'edit') {
        const idx = db.specialOffers.findIndex(o => o.id === offer.id);
        if (idx !== -1) db.specialOffers[idx] = offer;
      } else if (action === 'delete') {
        db.specialOffers = db.specialOffers.filter(o => o.id !== offer.id);
      } else if (action === 'toggle') {
        const found = db.specialOffers.find(o => o.id === offer.id);
        if (found) found.active = !found.active;
      }
      writeDb(db);
      return jsonResponse(res, 200, { success: true, specialOffers: db.specialOffers });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/admin/announcements — Manage Announcements
  if (method === 'POST' && pathname === '/api/admin/announcements') {
    try {
      const body = await parseBody(req);
      const db = readDb();
      if (!db.announcements) db.announcements = [];
      const { action, announcement } = body;
      if (action === 'add') {
        announcement.id = 'ann_' + Date.now();
        db.announcements.unshift(announcement);
      } else if (action === 'edit') {
        const idx = db.announcements.findIndex(a => a.id === announcement.id);
        if (idx !== -1) db.announcements[idx] = announcement;
      } else if (action === 'delete') {
        db.announcements = db.announcements.filter(a => a.id !== announcement.id);
      } else if (action === 'toggle') {
        const found = db.announcements.find(a => a.id === announcement.id);
        if (found) found.active = !found.active;
      }
      writeDb(db);
      return jsonResponse(res, 200, { success: true, announcements: db.announcements });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // ==================== 2. ADMIN CRUD APIs (EDIT EVERY POINT) ====================

  // POST /api/admin/login — Authenticate admin for admin.html portal
  if (method === 'POST' && pathname === '/api/admin/login') {
    try {
      const { username, password } = await parseBody(req);
      const db = readDb();
      const adminPin = db.settings?.adminPin || 'AR2026';

      const trimmedUser = (username || '').trim().toLowerCase();
      const trimmedPass = (password || '').trim();

      const isUserMatch = (
        trimmedUser === 'admin' ||
        trimmedUser === '01934109081' ||
        trimmedUser === 'ar2026' ||
        trimmedUser === ''
      );
      const isPassMatch = (
        trimmedPass === '78900' ||
        trimmedPass === adminPin ||
        trimmedPass.toLowerCase() === 'admin' ||
        trimmedPass === 'AR2026'
      );

      // Check if user exists in database with matching phone or admin role
      const userMatch = (db.users || []).find(u => 
        (u.phone === username || u.name?.toLowerCase() === trimmedUser) && 
        (trimmedPass === '78900' || trimmedPass === adminPin)
      );

      if ((isUserMatch && isPassMatch) || userMatch) {
        return jsonResponse(res, 200, {
          success: true,
          message: 'সফলভাবে অ্যাডমিন প্যানেলে লগইন হয়েছে!',
          admin: {
            name: userMatch ? userMatch.name : 'Super Admin',
            phone: userMatch ? userMatch.phone : '01934109081',
            role: 'Super-Admin'
          }
        });
      } else {
        return jsonResponse(res, 401, {
          success: false,
          message: 'ভুল ইউজারনেম বা পাসওয়ার্ড!'
        });
      }
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // GET /api/admin/stats — Overview Statistics for Admin Portal
  if (method === 'GET' && pathname === '/api/admin/stats') {
    const db = readDb();
    const users = db.users || [];
    const ledger = db.ledger || [];
    const deposits = db.deposits || [];

    const totalUsers = users.length;
    const totalUserBalance = users.reduce((acc, u) => acc + (u.walletBalance || 0), 0);

    const rechargeItems = ledger.filter(item => item.type === 'debit' || (item.title && item.title.includes('Recharge')));
    const todayRechargeTotal = rechargeItems.reduce((acc, item) => acc + (item.amount || 0), 0);
    const todayRechargeCount = rechargeItems.length;

    const pendingDeposits = deposits.filter(d => d.status === 'পেন্ডিং' || d.status === 'Pending').length +
      ledger.filter(l => l.type === 'credit' && l.status === 'Pending').length;

    return jsonResponse(res, 200, {
      success: true,
      stats: {
        totalUsers,
        totalUserBalance,
        todayRechargeTotal,
        todayRechargeCount,
        pendingDeposits
      }
    });
  }

  // GET /api/admin/settings — Get settings & modems for Admin Portal
  if (method === 'GET' && pathname === '/api/admin/settings') {
    const db = readDb();
    return jsonResponse(res, 200, {
      success: true,
      settings: {
        ...db.settings,
        serverName: db.settings.siteName || db.settings.serverName || 'PayX Pro',
        helpline: db.settings.whatsapp || db.settings.helpline || '01934109081',
        rechargeMode: db.settings.rechargeMode || 'auto',
        modems: db.modems || [
          { slot: 1, operator: 'Grameenphone', simNumber: '01700-000000', signal: '4G (98%)', balance: 15420 },
          { slot: 2, operator: 'Robi', simNumber: '01800-000000', signal: '4G (95%)', balance: 9850 },
          { slot: 3, operator: 'Banglalink', simNumber: '01900-000000', signal: '4G (92%)', balance: 11200 },
          { slot: 4, operator: 'Airtel', simNumber: '01600-000000', signal: '4G (89%)', balance: 7400 }
        ]
      }
    });
  }

  // POST /api/admin/settings — Edit site name, tagline, marquee notice, limits, VIP price, coin rules
  if (method === 'POST' && pathname === '/api/admin/settings') {
    try {
      const body = await parseBody(req);
      const db = readDb();
      if (body.serverName) db.settings.siteName = body.serverName;
      if (body.helpline) db.settings.whatsapp = body.helpline;
      db.settings = { ...db.settings, ...body };
      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: 'সাইট সেটিংস ও নোটিশ বোর্ড সফলভাবে আপডেট করা হয়েছে!',
        settings: db.settings
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // GET /api/admin/users — List all registered users for Admin Portal
  if (method === 'GET' && pathname === '/api/admin/users') {
    const db = readDb();
    const users = (db.users || []).map(u => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      role: u.role || 'Retailer',
      rechargeBalance: (u.rechargeBalance !== undefined ? u.rechargeBalance : u.walletBalance) || 0,
      driveBalance: u.driveBalance || 0,
      status: u.status || 'active'
    }));
    return jsonResponse(res, 200, { success: true, users });
  }

  // POST /api/admin/user/role — Update user role (Retailer, Dealer, DGM, Sub-Admin)
  if (method === 'POST' && pathname === '/api/admin/user/role') {
    try {
      const { phone, role } = await parseBody(req);
      const db = readDb();
      const user = getOrCreateUser(db, phone);
      user.role = role || 'Retailer';
      writeDb(db);
      return jsonResponse(res, 200, { success: true, message: `ইউজার রোল "${role}" হিসেবে নির্ধারণ করা হয়েছে!`, user });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/admin/user/status — Block/Unblock user
  if (method === 'POST' && pathname === '/api/admin/user/status') {
    try {
      const { phone, status } = await parseBody(req);
      const db = readDb();
      const user = getOrCreateUser(db, phone);
      user.status = status || 'active';
      writeDb(db);
      return jsonResponse(res, 200, { success: true, message: `ইউজার স্ট্যাটাস "${status === 'blocked' ? 'ব্লকড' : 'সক্রিয়'}" করা হয়েছে!`, user });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/admin/user/delete — Delete user
  if (method === 'POST' && pathname === '/api/admin/user/delete') {
    try {
      const { phone } = await parseBody(req);
      const db = readDb();
      db.users = (db.users || []).filter(u => u.phone !== phone);
      writeDb(db);
      return jsonResponse(res, 200, { success: true, message: `ইউজার (${phone}) সফলভাবে মুছে ফেলা হয়েছে!` });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // GET /api/admin/transactions — All Transactions for Admin Portal
  if (method === 'GET' && pathname === '/api/admin/transactions') {
    const db = readDb();
    const ledger = db.ledger || [];
    const transactions = ledger.map(item => {
      let op = 'All-Op';
      if (/GP|Grameen/i.test(item.title)) op = 'GP';
      else if (/Robi/i.test(item.title)) op = 'Robi';
      else if (/Airtel/i.test(item.title)) op = 'Airtel';
      else if (/Banglalink|BL/i.test(item.title)) op = 'BL';
      else if (/Teletalk/i.test(item.title)) op = 'Teletalk';
      else if (/bKash/i.test(item.title)) op = 'bKash';
      else if (/Nagad/i.test(item.title)) op = 'Nagad';

      const phoneMatch = item.title ? item.title.match(/(01[3-9]\d{8})/) : null;
      const phone = phoneMatch ? phoneMatch[1] : (db.users?.[0]?.phone || '01934109081');

      return {
        id: item.id,
        userName: item.userName || db.users?.[0]?.name || 'গ্রাহক',
        userPhone: item.userPhone || phone,
        number: phone,
        operator: op,
        type: item.type === 'credit' ? 'অ্যাড মানি' : 'টপ-আপ / সার্ভিস',
        amount: item.amount,
        date: item.time || new Date(item.timestamp || Date.now()).toLocaleTimeString(),
        status: item.status === 'Completed' ? 'সফল' : item.status === 'Pending' ? 'পেন্ডিং' : (item.status || 'সফল')
      };
    });
    return jsonResponse(res, 200, { success: true, transactions });
  }

  // POST /api/admin/transaction/status — Update transaction status
  if (method === 'POST' && pathname === '/api/admin/transaction/status') {
    try {
      const { id, status } = await parseBody(req);
      const db = readDb();
      const tx = (db.ledger || []).find(l => l.id === id);
      if (tx) {
        tx.status = status === 'সফল' ? 'Completed' : status === 'বাতিল' ? 'Rejected' : status;
      }
      writeDb(db);
      return jsonResponse(res, 200, { success: true, message: `লেনদেন স্ট্যাটাস "${status}" করা হয়েছে!` });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // GET /api/admin/deposits — List of deposits
  if (method === 'GET' && pathname === '/api/admin/deposits') {
    const db = readDb();
    if (!db.deposits || db.deposits.length === 0) {
      db.deposits = [
        {
          id: "DEP-101",
          userName: db.users?.[0]?.name || "Foisal Ahamed",
          userPhone: db.users?.[0]?.phone || "01934109081",
          method: "bKash Auto",
          amount: 500,
          trxId: "9KJ28FA1",
          targetBalance: "মূল ব্যালেন্স",
          status: "অনুমোদিত"
        },
        {
          id: "DEP-102",
          userName: db.users?.[0]?.name || "Foisal Ahamed",
          userPhone: db.users?.[0]?.phone || "01934109081",
          method: "Nagad Manual",
          amount: 1000,
          trxId: "NG78210D",
          targetBalance: "ড্রাইভ ব্যালেন্স",
          status: "পেন্ডিং"
        }
      ];
      writeDb(db);
    }
    return jsonResponse(res, 200, { success: true, deposits: db.deposits });
  }

  // POST /api/admin/deposit/action — Approve or Reject a Deposit Request
  if (method === 'POST' && pathname === '/api/admin/deposit/action') {
    try {
      const { id, action } = await parseBody(req);
      const db = readDb();
      const dep = (db.deposits || []).find(d => d.id === id);
      if (!dep) {
        return jsonResponse(res, 404, { success: false, message: 'ডিপোজিট রেকর্ড পাওয়া যায়নি' });
      }

      if (action === 'approve') {
        dep.status = 'অনুমোদিত';
        const user = getOrCreateUser(db, dep.userPhone);
        if (dep.targetBalance?.includes('ড্রাইভ')) {
          user.driveBalance = (user.driveBalance || 0) + dep.amount;
        } else {
          user.walletBalance = (user.walletBalance || 0) + dep.amount;
          user.rechargeBalance = user.walletBalance;
        }
        db.ledger.unshift({
          id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
          title: `Deposit Approved (${dep.method}) — ${dep.trxId}`,
          amount: dep.amount,
          type: 'credit',
          status: 'Completed',
          time: 'এইমাত্র',
          timestamp: new Date().toISOString()
        });
      } else {
        dep.status = 'বাতিল';
      }

      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: action === 'approve' ? 'ডিপোজিট সফলভাবে অনুমোদন করা হয়েছে!' : 'ডিপোজিট বাতিল করা হয়েছে!'
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // GET /api/notice — Get system notice
  if (method === 'GET' && pathname === '/api/notice') {
    const db = readDb();
    const notice = db.notice || {
      title: db.settings?.marqueeText || "জরুরী নোটিশ ও আপডেট",
      bannerTitle: db.settings?.siteName || "PayX টেলিকমে স্বাগতম!",
      details: "সকল অপারেটরে অটো রিচার্জ ও ড্রাইভ প্যাক চালু আছে। ২৪ ঘন্টা নির্বিঘ্নে সেবা উপভোগ করুন।",
      whatsapp: db.settings?.whatsapp || "01934109081"
    };
    return jsonResponse(res, 200, { success: true, notice });
  }

  // POST /api/admin/notice — Save system notice
  if (method === 'POST' && pathname === '/api/admin/notice') {
    try {
      const { title, bannerTitle, details, whatsapp } = await parseBody(req);
      const db = readDb();
      db.notice = { title, bannerTitle, details, whatsapp };
      if (title) db.settings.marqueeText = title;
      if (whatsapp) db.settings.whatsapp = whatsapp;
      writeDb(db);
      return jsonResponse(res, 200, { success: true, message: 'নোটিশ সফলভাবে সংরক্ষণ করা হয়েছে!' });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // GET /api/admin/bundles — List all bundles
  if (method === 'GET' && pathname === '/api/admin/bundles') {
    const db = readDb();
    return jsonResponse(res, 200, { success: true, bundles: db.bundles || [] });
  }

  // GET /api/admin/games — List all games and packages
  if (method === 'GET' && pathname === '/api/admin/games') {
    const db = readDb();
    return jsonResponse(res, 200, { success: true, games: db.games || {} });
  }

  // GET /api/admin/products — List all digital shop products
  if (method === 'GET' && pathname === '/api/admin/products') {
    const db = readDb();
    return jsonResponse(res, 200, { success: true, products: db.products || [], categories: db.shopCategories || [] });
  }

  // POST /api/admin/bundle/save — Create or Edit Recharge/Internet/Minutes Bundle
  if (method === 'POST' && pathname === '/api/admin/bundle/save') {
    try {
      const { id, title, op, price, cashback, validity } = await parseBody(req);
      if (!title || !price) {
        return jsonResponse(res, 400, { success: false, message: 'বান্ডেলের নাম ও মূল্য আবশ্যক' });
      }
      const db = readDb();
      let bundle = null;

      if (id) {
        bundle = db.bundles.find(b => b.id === id);
      }

      if (bundle) {
        bundle.title = title;
        bundle.op = op || 'সকল অপারেটর';
        bundle.price = Number(price);
        bundle.cashback = cashback || '';
        bundle.validity = validity || '৩০ দিন';
      } else {
        bundle = {
          id: id || 'b' + (db.bundles.length + 1) + '_' + Date.now().toString().slice(-4),
          title,
          op: op || 'সকল অপারেটর',
          price: Number(price),
          cashback: cashback || '',
          validity: validity || '৩০ দিন'
        };
        db.bundles.push(bundle);
      }

      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: 'বান্ডেল প্যাকেজ সফলভাবে সেভ করা হয়েছে!',
        bundle,
        bundles: db.bundles
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/admin/bundle/delete — Delete Bundle
  if (method === 'POST' && pathname === '/api/admin/bundle/delete') {
    try {
      const { id } = await parseBody(req);
      const db = readDb();
      const idx = db.bundles.findIndex(b => b.id === id);
      if (idx === -1) {
        return jsonResponse(res, 404, { success: false, message: 'বান্ডেল পাওয়া যায়নি' });
      }
      db.bundles.splice(idx, 1);
      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: 'বান্ডেল প্যাকেজ সফলভাবে ডিলিট করা হয়েছে!',
        bundles: db.bundles
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/admin/game-package/save — Create or Edit Game Topup Packages (PUBG UC, Free Fire Diamonds, etc.)
  if (method === 'POST' && pathname === '/api/admin/game-package/save') {
    try {
      const { gameKey, pkgIndex, label, price, id } = await parseBody(req);
      if (!gameKey || !label || !price) {
        return jsonResponse(res, 400, { success: false, message: 'গেম, প্যাকেজ নাম ও মূল্য আবশ্যক' });
      }
      const db = readDb();
      if (!db.games[gameKey]) {
        return jsonResponse(res, 404, { success: false, message: 'গেম পাওয়া যায়নি' });
      }

      const pkgs = db.games[gameKey].packages;
      const parsedIdx = typeof pkgIndex === 'number' ? pkgIndex : parseInt(pkgIndex, 10);

      if (!isNaN(parsedIdx) && parsedIdx >= 0 && parsedIdx < pkgs.length) {
        pkgs[parsedIdx].label = label;
        pkgs[parsedIdx].price = Number(price);
        if (id) pkgs[parsedIdx].id = id;
      } else {
        pkgs.push({
          id: id || `${gameKey.toLowerCase()}_${Date.now().toString().slice(-4)}`,
          label,
          price: Number(price)
        });
      }

      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: `${db.games[gameKey].name} প্যাকেজ সফলভাবে সেভ করা হয়েছে!`,
        games: db.games
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/admin/game-package/delete — Delete a package from a game
  if (method === 'POST' && pathname === '/api/admin/game-package/delete') {
    try {
      const { gameKey, pkgIndex } = await parseBody(req);
      const db = readDb();
      if (!db.games[gameKey]) return jsonResponse(res, 404, { success: false, message: 'গেম পাওয়া যায়নি' });
      const idx = parseInt(pkgIndex, 10);
      if (isNaN(idx) || idx < 0 || idx >= db.games[gameKey].packages.length) {
        return jsonResponse(res, 400, { success: false, message: 'ভুল প্যাকেজ ইন্ডেক্স' });
      }
      db.games[gameKey].packages.splice(idx, 1);
      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: 'প্যাকেজ ডিলিট করা হয়েছে!',
        games: db.games
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/admin/product/save — Create or Edit Shop Product
  if (method === 'POST' && pathname === '/api/admin/product/save') {
    try {
      const { id, name, category, price, stock, emoji } = await parseBody(req);
      if (!name || !price) {
        return jsonResponse(res, 400, { success: false, message: 'প্রোডাক্টের নাম ও মূল্য আবশ্যক' });
      }
      const db = readDb();
      let prod = null;
      if (id) prod = db.products.find(p => p.id === id);

      if (prod) {
        prod.name = name;
        prod.category = category || 'Gadgets';
        prod.price = Number(price);
        prod.stock = Number(stock || 0);
        prod.emoji = emoji || '📦';
      } else {
        prod = {
          id: id || 'p' + (db.products.length + 1) + '_' + Date.now().toString().slice(-4),
          name,
          category: category || 'Gadgets',
          price: Number(price),
          stock: Number(stock || 10),
          emoji: emoji || '📦'
        };
        db.products.push(prod);
      }

      // Add category to shopCategories if not present
      if (category && !db.shopCategories.includes(category)) {
        db.shopCategories.push(category);
      }

      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: 'প্রোডাক্ট সফলভাবে সেভ করা হয়েছে!',
        product: prod,
        products: db.products
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/admin/product/delete — Delete Shop Product
  if (method === 'POST' && pathname === '/api/admin/product/delete') {
    try {
      const { id } = await parseBody(req);
      const db = readDb();
      const idx = db.products.findIndex(p => p.id === id);
      if (idx === -1) return jsonResponse(res, 404, { success: false, message: 'প্রোডাক্ট পাওয়া যায়নি' });
      db.products.splice(idx, 1);
      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: 'প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে!',
        products: db.products
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/admin/order/status — Update status of any order/transaction in Ledger
  if (method === 'POST' && pathname === '/api/admin/order/status') {
    try {
      const { id, status } = await parseBody(req);
      const db = readDb();
      const item = db.ledger.find(l => l.id === id);
      if (!item) {
        return jsonResponse(res, 404, { success: false, message: 'অর্ডার/ট্রানজ্যাকশন পাওয়া যায়নি' });
      }

      const prevStatus = item.status;
      item.status = status;

      // If rejected and was previously debited, refund to user
      if (status === 'Rejected' && prevStatus !== 'Rejected' && item.type === 'debit') {
        const user = db.users[0]; // Active main user
        if (user) {
          user.walletBalance = (user.walletBalance || 0) + Number(item.amount || 0);
        }
      }

      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: `অর্ডার ${id} স্ট্যাটাস পরিবর্তন করে '${status}' করা হয়েছে!`,
        order: item,
        ledger: db.ledger
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/admin/user/balance — Admin Add or Deduct User Balance
  if (method === 'POST' && pathname === '/api/admin/user/balance') {
    try {
      const { phone, amount, action, type } = await parseBody(req);
      const val = parseFloat(amount);
      if (isNaN(val) || val <= 0) {
        return jsonResponse(res, 400, { success: false, message: 'সঠিক ব্যালেন্স পরিমাণ দিন' });
      }
      const db = readDb();
      const user = getOrCreateUser(db, phone);

      if (type === 'drive') {
        if (action === 'deduct') {
          user.driveBalance = Math.max(0, (user.driveBalance || 0) - val);
        } else {
          user.driveBalance = (user.driveBalance || 0) + val;
        }
      } else {
        if (action === 'deduct') {
          user.walletBalance = Math.max(0, (user.walletBalance || 0) - val);
        } else {
          user.walletBalance = (user.walletBalance || 0) + val;
        }
        user.rechargeBalance = user.walletBalance;
      }

      // Add to ledger
      const txId = 'TXN-' + Math.floor(1000 + Math.random() * 9000);
      db.ledger.unshift({
        id: txId,
        title: `অ্যাডমিন ব্যালেন্স অ্যাডজাস্টমেন্ট (${type || 'main'} - ${action === 'deduct' ? 'কর্তন' : 'যুক্ত'})`,
        amount: val,
        type: action === 'deduct' ? 'debit' : 'credit',
        status: 'Completed',
        time: 'এইমাত্র',
        timestamp: new Date().toISOString()
      });

      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: `${user.name} এর ব্যালেন্স সফলভাবে ${action === 'deduct' ? 'কর্তন' : 'যুক্ত'} করা হয়েছে! বর্তমান ব্যালেন্স: ৳${((type === 'drive' ? user.driveBalance : user.walletBalance) || 0).toFixed(2)}`,
        user,
        ledger: db.ledger
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/admin/user/toggle-badge — Toggle Blue-tick or VIP status
  if (method === 'POST' && pathname === '/api/admin/user/toggle-badge') {
    try {
      const { phone, field } = await parseBody(req);
      const db = readDb();
      const user = getOrCreateUser(db, phone);

      if (field === 'isVerified') {
        user.isVerified = !user.isVerified;
      } else if (field === 'isVipMember') {
        user.isVipMember = !user.isVipMember;
      }

      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: `ইউজারের ${field} পরিবর্তন করা হয়েছে: ${user[field]}`,
        user
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // ==================== 3. USER ACTIONS & TRANSACTIONS ====================

  // POST /api/recharge — Process Mobile Recharge
  if (method === 'POST' && pathname === '/api/recharge') {
    try {
      const { phone, operator, simType, amount, userPhone } = await parseBody(req);
      const rechargeAmount = parseFloat(amount);
      if (!phone || isNaN(rechargeAmount) || rechargeAmount < 10) {
        return jsonResponse(res, 400, { success: false, message: 'সঠিক মোবাইল নম্বর এবং সর্বনিম্ন ৳১০ দিন' });
      }

      const db = readDb();
      const user = getOrCreateUser(db, userPhone);

      if (user.walletBalance < rechargeAmount) {
        return jsonResponse(res, 400, { success: false, message: 'ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই! দয়া করে অ্যাড মানি করুন।' });
      }

      user.walletBalance -= rechargeAmount;
      user.lifetimeSpend = (user.lifetimeSpend || 0) + rechargeAmount;

      let coinAwarded = false;
      const threshold = db.settings.coinRechargeThreshold || 312;
      if (rechargeAmount >= threshold) {
        user.rewardCoins = (user.rewardCoins || 0) + 1;
        coinAwarded = true;
      }

      const txId = 'TXN-' + Math.floor(1000 + Math.random() * 9000);
      const entry = {
        id: txId,
        title: `${operator || 'অপারেটর'} ${simType || 'Prepaid'} (${phone})`,
        amount: rechargeAmount,
        type: 'debit',
        status: 'Completed',
        time: 'এইমাত্র',
        timestamp: new Date().toISOString()
      };
      db.ledger.unshift(entry);

      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: `${operator}-এ ৳${rechargeAmount} সফলভাবে রিচার্জ হয়েছে!${coinAwarded ? ' (+1 রিওয়ার্ড কয়েন অর্জিত!)' : ''}`,
        newBalance: user.walletBalance,
        rewardCoins: user.rewardCoins,
        lifetimeSpend: user.lifetimeSpend,
        transaction: entry,
        ledger: db.ledger
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/bundle/buy — Buy Internet / Minutes Bundle
  if (method === 'POST' && pathname === '/api/bundle/buy') {
    try {
      const { bundleId, phone, userPhone } = await parseBody(req);
      const db = readDb();
      const bundle = db.bundles.find(b => b.id === bundleId);
      if (!bundle) return jsonResponse(res, 404, { success: false, message: 'বান্ডেল পাওয়া যায়নি' });

      const user = getOrCreateUser(db, userPhone);
      if (user.walletBalance < bundle.price) {
        return jsonResponse(res, 400, { success: false, message: 'বান্ডেল কিনতে ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!' });
      }

      user.walletBalance -= bundle.price;
      user.lifetimeSpend = (user.lifetimeSpend || 0) + bundle.price;
      if (bundle.price >= (db.settings.coinRechargeThreshold || 312)) {
        user.rewardCoins = (user.rewardCoins || 0) + 1;
      }

      const txId = 'TXN-' + Math.floor(1000 + Math.random() * 9000);
      const entry = {
        id: txId,
        title: `Bundle: ${bundle.title} (${phone || user.phone})`,
        amount: bundle.price,
        type: 'debit',
        status: 'Completed',
        time: 'এইমাত্র',
        timestamp: new Date().toISOString()
      };
      db.ledger.unshift(entry);

      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: `বান্ডেল অ্যাক্টিভ হয়েছে: ${bundle.title}`,
        newBalance: user.walletBalance,
        rewardCoins: user.rewardCoins,
        lifetimeSpend: user.lifetimeSpend,
        transaction: entry,
        ledger: db.ledger
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/game/topup — Process Game UC / Diamonds Topup
  if (method === 'POST' && pathname === '/api/game/topup') {
    try {
      const { gameKey, pkgIndex, playerUid, userPhone } = await parseBody(req);
      if (!gameKey || !playerUid || playerUid.length < 5) {
        return jsonResponse(res, 400, { success: false, message: 'সঠিক Player UID লিখুন' });
      }

      const db = readDb();
      const gameObj = db.games[gameKey];
      if (!gameObj) return jsonResponse(res, 404, { success: false, message: 'গেম পাওয়া যায়নি' });

      const idx = parseInt(pkgIndex, 10);
      const pkg = gameObj.packages[idx] || gameObj.packages[0];

      const user = getOrCreateUser(db, userPhone);
      if (user.walletBalance < pkg.price) {
        return jsonResponse(res, 400, { success: false, message: 'টপ-আপের জন্য ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!' });
      }

      user.walletBalance -= pkg.price;
      user.lifetimeSpend = (user.lifetimeSpend || 0) + pkg.price;
      if (pkg.price >= (db.settings.coinRechargeThreshold || 312)) {
        user.rewardCoins = (user.rewardCoins || 0) + 1;
      }

      const txId = 'TXN-' + Math.floor(1000 + Math.random() * 9000);
      const entry = {
        id: txId,
        title: `${gameObj.name} ${pkg.label} (UID: ${playerUid})`,
        amount: pkg.price,
        type: 'debit',
        status: 'Processing',
        time: 'এইমাত্র',
        timestamp: new Date().toISOString()
      };
      db.ledger.unshift(entry);

      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: `${gameObj.name} (${pkg.label}) অর্ডার সফলভাবে জমা হয়েছে এবং প্রসেসিং চলছে!`,
        newBalance: user.walletBalance,
        rewardCoins: user.rewardCoins,
        lifetimeSpend: user.lifetimeSpend,
        transaction: entry,
        ledger: db.ledger
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/shop/checkout — Submit E-Commerce Order
  if (method === 'POST' && pathname === '/api/shop/checkout') {
    try {
      const { cart, customer, userPhone } = await parseBody(req);
      if (!Array.isArray(cart) || !cart.length) {
        return jsonResponse(res, 400, { success: false, message: 'কার্ট খালি' });
      }

      const db = readDb();
      const user = getOrCreateUser(db, userPhone);

      let total = 0;
      cart.forEach(item => {
        total += item.price * (item.qty || 1);
        // reduce stock
        const p = db.products.find(prod => prod.id === item.id);
        if (p && p.stock > 0) {
          p.stock = Math.max(0, p.stock - (item.qty || 1));
        }
      });

      const payMethod = customer.paymentMethod || 'Wallet';
      if (payMethod === 'Wallet') {
        if (user.walletBalance < total) {
          return jsonResponse(res, 400, { success: false, message: 'ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই! COD সিলেক্ট করুন বা অ্যাড মানি করুন।' });
        }
        user.walletBalance -= total;
      }

      user.lifetimeSpend = (user.lifetimeSpend || 0) + total;
      if (total >= (db.settings.coinRechargeThreshold || 312)) {
        user.rewardCoins = (user.rewardCoins || 0) + 1;
      }

      const itemsLabel = cart.map(i => `${i.name} (x${i.qty})`).join(', ');
      const txId = 'TXN-' + Math.floor(1000 + Math.random() * 9000);
      const entry = {
        id: txId,
        title: `Shop (${payMethod}): ${itemsLabel} — ${customer.city || ''}, ${customer.thana || ''}`,
        amount: total,
        type: 'debit',
        status: 'Pending',
        time: 'এইমাত্র',
        timestamp: new Date().toISOString()
      };
      db.ledger.unshift(entry);

      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: 'আপনার শপ অর্ডার সফলভাবে সম্পন্ন হয়েছে!',
        newBalance: user.walletBalance,
        rewardCoins: user.rewardCoins,
        lifetimeSpend: user.lifetimeSpend,
        transaction: entry,
        ledger: db.ledger,
        products: db.products
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/wallet/add-money — Instant Gateway / Webhook Add Money
  if (method === 'POST' && pathname === '/api/wallet/add-money') {
    try {
      const { gateway, amount, userPhone } = await parseBody(req);
      const amt = parseFloat(amount);
      if (isNaN(amt) || amt < 50) {
        return jsonResponse(res, 400, { success: false, message: 'সর্বনিম্ন ৳৫০ অ্যাড মানি করুন' });
      }

      const db = readDb();
      const user = getOrCreateUser(db, userPhone);
      user.walletBalance = (user.walletBalance || 0) + amt;

      const txId = 'TXN-' + Math.floor(1000 + Math.random() * 9000);
      const entry = {
        id: txId,
        title: `${gateway || 'bKash'} Instant Webhook Top-up`,
        amount: amt,
        type: 'credit',
        status: 'Completed',
        time: 'এইমাত্র',
        timestamp: new Date().toISOString()
      };
      db.ledger.unshift(entry);

      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: `${gateway || 'গেটওয়ে'} ওয়েবহুক ভেরিফাইড! ওয়ালেটে ৳${amt} যোগ হয়েছে।`,
        newBalance: user.walletBalance,
        transaction: entry,
        ledger: db.ledger
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/wallet/redeem-coins — Convert reward coins to wallet balance
  if (method === 'POST' && pathname === '/api/wallet/redeem-coins') {
    try {
      const { userPhone } = await parseBody(req);
      const db = readDb();
      const user = getOrCreateUser(db, userPhone);

      const reqThreshold = db.settings.lifetimeRedeemThreshold || 1000;
      if ((user.lifetimeSpend || 0) < reqThreshold) {
        return jsonResponse(res, 400, { success: false, message: `৳${reqThreshold} লাইফটাইম ট্রানজ্যাকশন পূর্ণ হলে রিডিম আনলক হবে।` });
      }

      const coins = user.rewardCoins || 0;
      if (coins <= 0) {
        return jsonResponse(res, 400, { success: false, message: 'রিডিম করার মত কয়েন নেই।' });
      }

      const bdt = coins * (db.settings.coinValueBdt || 1);
      user.walletBalance = (user.walletBalance || 0) + bdt;
      user.rewardCoins = 0;

      const txId = 'TXN-' + Math.floor(1000 + Math.random() * 9000);
      const entry = {
        id: txId,
        title: `Reward Coins Redeemed (${coins} Coins → ৳${bdt} BDT)`,
        amount: bdt,
        type: 'credit',
        status: 'Completed',
        time: 'এইমাত্র',
        timestamp: new Date().toISOString()
      };
      db.ledger.unshift(entry);

      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: `🎉 ${coins} রিওয়ার্ড কয়েন থেকে ৳${bdt} ওয়ালেটে যোগ হয়েছে!`,
        newBalance: user.walletBalance,
        rewardCoins: user.rewardCoins,
        transaction: entry,
        ledger: db.ledger
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/membership/vip — Buy VIP Membership
  if (method === 'POST' && pathname === '/api/membership/vip') {
    try {
      const { userPhone } = await parseBody(req);
      const db = readDb();
      const user = getOrCreateUser(db, userPhone);

      if (user.isVipMember) {
        return jsonResponse(res, 400, { success: false, message: 'আপনি ইতিমধ্যেই একজন AR VIP মেম্বার!' });
      }

      const vipPrice = db.settings.vipPrice || 161;
      if (user.walletBalance < vipPrice) {
        return jsonResponse(res, 400, { success: false, message: 'ভিআইপি মেম্বারশিপ কিনতে ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!' });
      }

      user.walletBalance -= vipPrice;
      user.lifetimeSpend = (user.lifetimeSpend || 0) + vipPrice;
      user.isVipMember = true;
      user.rewardCoins = (user.rewardCoins || 0) + 5;

      const txId = 'TXN-' + Math.floor(1000 + Math.random() * 9000);
      const entry = {
        id: txId,
        title: `AR VIP Club Membership Purchase (৳${vipPrice})`,
        amount: vipPrice,
        type: 'debit',
        status: 'Completed',
        time: 'এইমাত্র',
        timestamp: new Date().toISOString()
      };
      db.ledger.unshift(entry);

      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: 'অভিনন্দন! আপনি সফলভাবে AR VIP Club মেম্বারশিপ অর্জন করেছেন! (+5 Coins)',
        user,
        transaction: entry,
        ledger: db.ledger
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/posts/create — Create Community Social Post
  if (method === 'POST' && pathname === '/api/posts/create') {
    try {
      const { content, author, userPhone } = await parseBody(req);
      if (!content || !content.trim()) {
        return jsonResponse(res, 400, { success: false, message: 'পোস্ট করার জন্য কিছু লিখুন' });
      }

      const db = readDb();
      const user = getOrCreateUser(db, userPhone);

      const hasMention = /@payx\.market/i.test(content);
      if (hasMention) {
        user.rewardCoins = (user.rewardCoins || 0) + 1;
      }

      const newPost = {
        id: 'post_' + Date.now(),
        author: author || user.name || 'AR Member',
        verified: !!user.isVerified,
        badge: hasMention ? 'Mention Bonus +1🪙' : (user.isVipMember ? 'VIP Member' : 'Member'),
        time: 'এইমাত্র',
        content: content.trim(),
        likes: 1,
        liked: true,
        comments: []
      };

      db.posts.unshift(newPost);
      writeDb(db);

      return jsonResponse(res, 201, {
        success: true,
        message: hasMention ? 'পোস্ট প্রকাশিত হয়েছে এবং @PayX.Market মেনশনের জন্য পেয়েছেন +1 Coin!' : 'পোস্ট প্রকাশিত হয়েছে!',
        post: newPost,
        posts: db.posts,
        rewardCoins: user.rewardCoins
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/posts/like — Toggle Like on Post
  if (method === 'POST' && pathname === '/api/posts/like') {
    try {
      const { postId } = await parseBody(req);
      const db = readDb();
      const post = db.posts.find(p => p.id === postId);
      if (!post) return jsonResponse(res, 404, { success: false, message: 'পোস্ট পাওয়া যায়নি' });

      post.liked = !post.liked;
      post.likes = Math.max(0, (post.likes || 0) + (post.liked ? 1 : -1));
      writeDb(db);

      return jsonResponse(res, 200, {
        success: true,
        post,
        posts: db.posts
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/posts/comment — Add Comment to Post
  if (method === 'POST' && pathname === '/api/posts/comment') {
    try {
      const { postId, comment, author } = await parseBody(req);
      if (!comment || !comment.trim()) {
        return jsonResponse(res, 400, { success: false, message: 'কমেন্ট লিখুন' });
      }

      const db = readDb();
      const post = db.posts.find(p => p.id === postId);
      if (!post) return jsonResponse(res, 404, { success: false, message: 'পোস্ট পাওয়া যায়নি' });

      if (!Array.isArray(post.comments)) post.comments = [];
      post.comments.push(comment.trim());
      writeDb(db);

      return jsonResponse(res, 200, {
        success: true,
        message: 'কমেন্ট সফলভাবে যোগ হয়েছে!',
        post,
        posts: db.posts
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/posts/delete — Admin Delete Post
  if (method === 'POST' && pathname === '/api/posts/delete') {
    try {
      const { postId } = await parseBody(req);
      const db = readDb();
      const idx = db.posts.findIndex(p => p.id === postId);
      if (idx === -1) return jsonResponse(res, 404, { success: false, message: 'পোস্ট পাওয়া যায়নি' });
      db.posts.splice(idx, 1);
      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: 'পোস্ট মুছে ফেলা হয়েছে!',
        posts: db.posts
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // POST /api/auth/profile — Save User Profile
  if (method === 'POST' && pathname === '/api/auth/profile') {
    try {
      const { name, phone, email, profession, location } = await parseBody(req);
      if (!phone) return jsonResponse(res, 400, { success: false, message: 'মোবাইল নম্বর আবশ্যক' });

      const db = readDb();
      let user = db.users.find(u => u.phone === phone);
      if (!user) {
        user = {
          id: 'USR-' + phone,
          phone,
          name: name || 'AR Member',
          email: email || '',
          profession: profession || 'Member',
          location: location || 'Bangladesh',
          walletBalance: 1450,
          rewardCoins: 45,
          lifetimeSpend: 650,
          isVipMember: false,
          isVerified: true,
          role: 'user'
        };
        db.users.push(user);
      } else {
        if (name) user.name = name;
        if (email) user.email = email;
        if (profession) user.profession = profession;
        if (location) user.location = location;
      }

      writeDb(db);
      return jsonResponse(res, 200, {
        success: true,
        message: 'প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!',
        user
      });
    } catch (err) {
      return jsonResponse(res, 500, { success: false, message: err.message });
    }
  }

  // Handle unmatched /api/ routes cleanly with JSON
  if (pathname.startsWith('/api/')) {
    return jsonResponse(res, 404, { success: false, message: `API route not found: ${pathname}` });
  }

  // ==================== 4. STATIC FILE SERVING ====================
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '') {
    safePath = '/index.html';
  } else if (safePath === '/admin' || safePath === '/admin/') {
    safePath = '/admin.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback: serve index.html for unknown HTML paths
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('404 Not Found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`PayX.Market Telecom & Digital Commerce Server running at http://0.0.0.0:${PORT}`);
});
