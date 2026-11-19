// Lucceass Topup Application State & Logic (Connected to Live REST Backend)

const state = {
  currentView: 'landing',
  isLoggedIn: localStorage.getItem('lucceass_logged_in') === 'true',
  user: {
    name: 'গ্রাহক',
    phone: '',
    role: 'Retailer',
    balanceRevealed: false,
    rechargeBalance: 0.00,
    driveBalance: 0.00,
    bankBalance: 0.00,
    kycVerified: false
  },
  selectedOperator: 'gp',
  selectedPackCategory: 'all',
  theme: localStorage.getItem('lucceass_theme') || 'light',
  colorTheme: localStorage.getItem('lucceass_color_theme') || 'default',
  pinInput: '',
  screenRecPin: '',
  rechargeOperator: 'gp',
  rechargeConnType: 'prepaid',
  transactions: []
};

// Operator Packages Database (Matching Image 3 & 4)
const packagesDb = {
  gp: [
    { title: '2997Tk-60GB+1200Minute 365Day', category: 'bundle', validity: '৩৬৫ দিন', price: 2997, tag: 'বান্ডেল' },
    { title: '1988Tk-100GB 365Day', category: 'data', validity: '৩৬৫ দিন', price: 1988, tag: 'ডাটা' },
    { title: '1497Tk-25GB+600Minute 90Day', category: 'bundle', validity: '৯০ দিন', price: 1497, tag: 'বান্ডেল' },
    { title: '1493Tk-300GB+2200Minute 30Day', category: 'bundle', validity: '৩০ দিন', price: 1493, tag: 'বান্ডেল' },
    { title: '1259Tk-2000Minute 30Day', category: 'voice', validity: '৩০ দিন', price: 1259, tag: 'ভয়েস' },
    { title: '998Tk-50GB+1000Min 30Day', category: 'bundle', validity: '৩০ দিন', price: 998, tag: 'বান্ডেল' },
    { title: '649Tk-30GB 30Day', category: 'data', validity: '৩০ দিন', price: 649, tag: 'ডাটা' },
    { title: '498Tk-800Minute 30Day', category: 'voice', validity: '৩০ দিন', price: 498, tag: 'ভয়েস' },
    { title: '119Tk-স্পেশাল কলরেট ৪৫প/মি 30Day', category: 'callrate', validity: '৩০ দিন', price: 119, tag: 'কল রেট' }
  ],
  robi: [
    { title: '1098Tk-60GB+1000Minute 30Day', category: 'bundle', validity: '৩০ দিন', price: 1098, tag: 'বান্ডেল' },
    { title: '799Tk-40GB 30Day', category: 'data', validity: '৩০ দিন', price: 799, tag: 'ডাটা' },
    { title: '599Tk-900Minute 30Day', category: 'voice', validity: '৩০ দিন', price: 599, tag: 'ভয়েস' },
    { title: '348Tk-15GB+300Min 7Day', category: 'bundle', validity: '৭ দিন', price: 348, tag: 'বান্ডেল' },
    { title: '89Tk-স্পেশাল কলরেট 30Day', category: 'callrate', validity: '৩০ দিন', price: 89, tag: 'কল রেট' }
  ],
  bl: [
    { title: '999Tk-55GB+900Min 30Day', category: 'bundle', validity: '৩০ দিন', price: 999, tag: 'বান্ডেল' },
    { title: '699Tk-35GB 30Day', category: 'data', validity: '৩০ দিন', price: 699, tag: 'ডাটা' },
    { title: '487Tk-750Minute 30Day', category: 'voice', validity: '৩০ দিন', price: 487, tag: 'ভয়েস' },
    { title: '298Tk-12GB+200Min 7Day', category: 'bundle', validity: '৭ দিন', price: 298, tag: 'বান্ডেল' }
  ],
  airtel: [
    { title: '898Tk-50GB+800Min 30Day', category: 'bundle', validity: '৩০ দিন', price: 898, tag: 'বান্ডেল' },
    { title: '648Tk-30GB 30Day', category: 'data', validity: '৩০ দিন', price: 648, tag: 'ডাটা' },
    { title: '448Tk-700Minute 30Day', category: 'voice', validity: '৩০ দিন', price: 448, tag: 'ভয়েস' }
  ],
  teletalk: [
    { title: '650Tk-30GB+600Min 30Day', category: 'bundle', validity: '৩০ দিন', price: 650, tag: 'বান্ডেল' },
    { title: '450Tk-25GB 30Day', category: 'data', validity: '৩০ দিন', price: 450, tag: 'ডাটা' },
    { title: '320Tk-500Minute 30Day', category: 'voice', validity: '৩০ দিন', price: 320, tag: 'ভয়েস' }
  ],
  skitto: [
    { title: '599Tk-30GB 30Day Reload Pack', category: 'data', validity: '৩০ দিন', price: 599, tag: 'ডাটা' },
    { title: '399Tk-15GB 30Day Reload Pack', category: 'data', validity: '৩০ দিন', price: 399, tag: 'ডাটা' }
  ]
};

// Operator Meta Data (Using exact extracted PNG assets)
const operatorMeta = {
  gp: { name: 'Grameenphone', prefix: ['017', '013'], icon: './assets/operators/gp.png' },
  robi: { name: 'Robi', prefix: ['018'], icon: './assets/operators/rb.png' },
  bl: { name: 'Banglalink', prefix: ['019', '014'], icon: './assets/operators/bl.png' },
  airtel: { name: 'Airtel', prefix: ['016'], icon: './assets/operators/ar.png' },
  teletalk: { name: 'Teletalk', prefix: ['015'], icon: './assets/operators/tl.png' },
  skitto: { name: 'Skitto', prefix: [], icon: './assets/operators/sk.png' }
};

// Router View Navigation with Dynamic Bottom Tab Highlighting
function navigate(viewName) {
  // If trying to access authenticated views while logged out, redirect to login
  const authOnlyViews = ['dashboard', 'recharge', 'packs', 'billpay', 'transactions', 'analytics', 'profile', 'settings'];
  if (!state.isLoggedIn && authOnlyViews.includes(viewName)) {
    viewName = 'login';
    showToast('দয়া করে প্রথমে লগইন করুন');
  }

  // Prevent re-rendering and layout recalculation if already on this view
  if (state.currentView === viewName) {
    window.scrollTo(0, 0);
    return;
  }

  state.currentView = viewName;
  
  // Hide all views
  document.querySelectorAll('.app-view').forEach(el => el.classList.add('hidden'));
  
  // Show target view with instant top scroll
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.remove('hidden');
    window.scrollTo(0, 0);
  }

  // Toggle App Wrapper, Header, Bottom Bar & Floating WhatsApp Visibility
  const appWrapper = document.getElementById('app-wrapper');
  const appHeader = document.getElementById('app-header');
  const bottomNav = document.getElementById('main-bottom-nav');
  const floatingWa = document.getElementById('floating-wa-btn');

  if (viewName === 'landing') {
    if (appWrapper) appWrapper.classList.add('hidden');
    if (appHeader) appHeader.classList.add('hidden');
    if (bottomNav) bottomNav.classList.add('hidden');
    if (floatingWa) floatingWa.classList.remove('hidden');
    const landingClass = 'bg-[#0B0F19] text-slate-100 min-h-screen antialiased selection:bg-primary selection:text-white';
    if (document.body.className !== landingClass) document.body.className = landingClass;
  } else if (viewName === 'login' || viewName === 'register') {
    if (appWrapper) appWrapper.classList.remove('hidden');
    if (appHeader) appHeader.classList.add('hidden');
    if (bottomNav) bottomNav.classList.add('hidden');
    if (floatingWa) floatingWa.classList.add('hidden');
    const authClass = 'bg-[#0B0F19] text-slate-100 min-h-screen antialiased selection:bg-primary selection:text-white flex items-center justify-center p-3 sm:p-4';
    if (document.body.className !== authClass) document.body.className = authClass;
  } else {
    // Authenticated App Views
    if (appWrapper) appWrapper.classList.remove('hidden');
    if (appHeader) appHeader.classList.remove('hidden');
    if (bottomNav) bottomNav.classList.remove('hidden');
    if (floatingWa) floatingWa.classList.add('hidden');
    const appClass = 'bg-[#f7f7fb] dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen pb-24 antialiased';
    if (document.body.className !== appClass) document.body.className = appClass;
    updateBottomNavActiveState(viewName);
  }

  // Close drawer if open
  closeDrawer();

  // Special triggers
  if (viewName === 'packs') renderPackages();
  if (viewName === 'transactions') renderTransactions();
  if (viewName === 'recharge') updateRechargeScreenBalance();
  if (viewName === 'dashboard' || viewName === 'profile' || viewName === 'analytics') updateProfileUI();
}

function updateBottomNavActiveState(viewName) {
  const tabs = ['transactions', 'analytics', 'dashboard', 'profile', 'settings'];
  
  // Map auxiliary views to main tab
  let activeTab = viewName;
  if (['recharge', 'packs', 'billpay'].includes(viewName)) {
    activeTab = 'dashboard';
  }

  tabs.forEach(tab => {
    const btn = document.getElementById(`nav-btn-${tab}`) || document.querySelector(`[data-nav="${tab}"]`);
    if (btn) {
      if (tab === activeTab) {
        if (!btn.classList.contains('active')) btn.classList.add('active');
      } else {
        if (btn.classList.contains('active')) btn.classList.remove('active');
      }
    }
  });
}

// REST API Helper
async function apiRequest(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(endpoint, options);
    return await res.json();
  } catch (err) {
    console.error('API Request Error:', err);
    return { success: false, message: 'সার্ভারে সংযোগ করতে ব্যর্থ হয়েছে!' };
  }
}

// Fetch User Profile from Backend
async function fetchUserProfile() {
  const phone = state.user.phone || '01934109081';
  const data = await apiRequest(`/api/user?phone=${phone}`);
  if (data.success && data.user) {
    state.user.name = data.user.name;
    state.user.phone = data.user.phone;
    state.user.role = data.user.role;
    state.user.rechargeBalance = data.user.rechargeBalance;
    state.user.driveBalance = data.user.driveBalance;
    state.user.bankBalance = data.user.bankBalance;
    updateProfileUI();
  }
}

// Fetch Transactions from Backend
async function fetchTransactions() {
  const data = await apiRequest('/api/transactions');
  if (data.success && data.transactions) {
    state.transactions = data.transactions;
    renderTransactions();
  }
}

// Update Profile Displays across the app
function updateProfileUI() {
  document.querySelectorAll('.user-name-display').forEach(el => el.innerText = state.user.name);
  document.querySelectorAll('.user-phone-display').forEach(el => el.innerText = state.user.phone);
  document.querySelectorAll('.user-role-display').forEach(el => el.innerText = state.user.role);

  // Update inline balance
  const balanceText = document.getElementById('user-balance-text');
  if (balanceText) {
    balanceText.textContent = state.user.balanceRevealed 
      ? `৳ ${state.user.rechargeBalance.toFixed(2)}` 
      : 'ব্যাল্যান্স দেখুন';
  }

  // Update Bottomsheet balances
  const bsRec = document.getElementById('bs-rec-balance');
  const bsDrive = document.getElementById('bs-drive-balance');
  const bsBank = document.getElementById('bs-bank-balance');
  if (bsRec) bsRec.innerText = `৳${state.user.rechargeBalance.toFixed(2)}`;
  if (bsDrive) bsDrive.innerText = `৳${state.user.driveBalance.toFixed(2)}`;
  if (bsBank) bsBank.innerText = `৳${state.user.bankBalance.toFixed(2)}`;

  updateRechargeScreenBalance();
}

function updateRechargeScreenBalance() {
  const scrBal = document.getElementById('recharge-page-balance');
  if (scrBal) scrBal.innerText = `৳${state.user.rechargeBalance.toFixed(2)}`;
}

// Balance Bottom-Sheet Modal (Matching Live Scan)
function openBalanceBottomSheet() {
  const sheet = document.getElementById('balance-bottomsheet');
  if (sheet) {
    updateProfileUI();
    sheet.classList.remove('hidden');
  }
}

function closeBalanceBottomSheet() {
  const sheet = document.getElementById('balance-bottomsheet');
  if (sheet) sheet.classList.add('hidden');
}

// Notice Announcement Modal (Matching Live Target Popup)
function openNoticeModal() {
  const modal = document.getElementById('notice-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeNoticeModal() {
  const modal = document.getElementById('notice-modal');
  if (modal) modal.classList.add('hidden');
}

// Toggle Inline Balance (Alternative Quick Reveal)
function toggleBalance() {
  state.user.balanceRevealed = !state.user.balanceRevealed;
  const balanceText = document.getElementById('user-balance-text');
  const balanceSub = document.getElementById('user-balance-sub');
  
  if (state.user.balanceRevealed) {
    balanceText.textContent = `৳ ${state.user.rechargeBalance.toFixed(2)}`;
    balanceSub.textContent = 'ট্যাপ করে গোপন করুন';
  } else {
    balanceText.textContent = 'ব্যাল্যান্স দেখুন';
    balanceSub.textContent = 'ট্যাপ করুন';
  }
}

// PIN Code Handling for Login View
function handlePinInput(digit) {
  if (state.pinInput.length < 5) {
    state.pinInput += digit;
    updatePinDots();
  }
}

function handlePinBackspace() {
  state.pinInput = state.pinInput.slice(0, -1);
  updatePinDots();
}

function handlePinClear() {
  state.pinInput = '';
  updatePinDots();
}

function handleHiddenLoginPin(input) {
  state.pinInput = input.value.slice(0, 5);
  updatePinDots();
}

function focusLoginPin() {
  const input = document.getElementById('login-hidden-pin');
  if (input) input.focus();
}

function promptChangePhone() {
  const current = document.getElementById('login-phone')?.value || '01934109081';
  const newPhone = prompt('আপনার নতুন মোবাইল নম্বর লিখুন:', current);
  if (newPhone && newPhone.trim().length >= 11) {
    const cleanPhone = newPhone.trim();
    const phoneInput = document.getElementById('login-phone');
    const phoneDisplay = document.getElementById('login-phone-display');
    if (phoneInput) phoneInput.value = cleanPhone;
    if (phoneDisplay) phoneDisplay.textContent = cleanPhone;
    showToast(`একাউন্ট নম্বর: ${cleanPhone}`);
  }
}

function updatePinDots() {
  for (let i = 1; i <= 5; i++) {
    const dot = document.getElementById(`pin-dot-${i}`);
    if (dot) {
      if (i <= state.pinInput.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    }
  }
}

// LOGIN SUBMISSION (Connected to POST /api/auth/login)
async function handleLoginSubmit(e) {
  if (e) e.preventDefault();
  const phone = document.getElementById('login-phone')?.value.trim() || '01934109081';
  
  if (state.pinInput.length < 5) {
    showToast('অনুগ্রহ করে ৫ অঙ্কের পাসওয়ার্ড/পিন দিন');
    return;
  }

  showToast('যাচাই করা হচ্ছে...');
  const res = await apiRequest('/api/auth/login', 'POST', {
    number: phone,
    password: state.pinInput
  });

  if (res.success && res.user) {
    state.isLoggedIn = true;
    state.user.name = res.user.name;
    state.user.phone = res.user.phone;
    state.user.role = res.user.role;
    state.user.rechargeBalance = res.user.rechargeBalance;
    state.user.driveBalance = res.user.driveBalance;
    state.user.bankBalance = res.user.bankBalance;
    localStorage.setItem('lucceass_logged_in', 'true');
    localStorage.setItem('lucceass_user_phone', res.user.phone);

    showToast(`স্বাগতম, ${res.user.name}!`);
    updateProfileUI();
    navigate('dashboard');
    setTimeout(() => openNoticeModal(), 400);
  } else {
    showToast(res.message || 'ভুল মোবাইল নাম্বার অথবা পিন!');
  }
}

// LOGOUT
function handleLogout() {
  state.isLoggedIn = false;
  localStorage.removeItem('lucceass_logged_in');
  closeDrawer();
  navigate('landing');
  showToast('সফলভাবে লগআউট সম্পন্ন হয়েছে!');
}

// Dedicated Recharge Screen Functions
function handleRechargePhoneInput(input) {
  const val = input.value.trim();
  if (val.length >= 3) {
    const prefix = val.substring(0, 3);
    for (const [key, meta] of Object.entries(operatorMeta)) {
      if (meta.prefix.includes(prefix)) {
        setRechargeOperator(key);
        break;
      }
    }
  }
}

function setRechargeOperator(key) {
  state.rechargeOperator = key;
  const meta = operatorMeta[key] || operatorMeta.gp;
  
  const iconSpan = document.getElementById('screen-rec-op-icon');
  const nameStrong = document.getElementById('screen-rec-op-name');
  if (iconSpan) iconSpan.innerHTML = `<img src="${meta.icon}" alt="${meta.name}" class="w-7 h-7 object-contain">`;
  if (nameStrong) nameStrong.innerText = meta.name;
}

function cycleRechargeOperator() {
  const ops = ['gp', 'robi', 'bl', 'airtel', 'teletalk', 'skitto'];
  const currentIndex = ops.indexOf(state.rechargeOperator);
  const nextIndex = (currentIndex + 1) % ops.length;
  setRechargeOperator(ops[nextIndex]);
  showToast(`অপারেটর: ${operatorMeta[ops[nextIndex]].name}`);
}

function setConnectionType(type, element) {
  state.rechargeConnType = type;
  document.querySelectorAll('.conn-type-pill').forEach(btn => {
    btn.classList.remove('active', 'bg-gradient-to-r', 'from-[#F82769]', 'to-[#52163C]', 'text-white');
    btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
  });
  if (element) {
    element.classList.add('active', 'bg-gradient-to-r', 'from-[#F82769]', 'to-[#52163C]', 'text-white');
    element.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
  }
}

function setRechargeAmount(amount) {
  const input = document.getElementById('screen-rec-amount');
  if (input) input.value = amount;
}

function handleScreenRecPinInput(input) {
  state.screenRecPin = input.value.slice(0, 5);
  for (let i = 1; i <= 5; i++) {
    const dot = document.getElementById(`scr-rec-pin-${i}`);
    if (dot) {
      if (i <= state.screenRecPin.length) {
        dot.classList.add('bg-[#F82769]', 'border-[#F82769]');
        dot.classList.remove('border-slate-300', 'dark:border-slate-600');
      } else {
        dot.classList.remove('bg-[#F82769]', 'border-[#F82769]');
        dot.classList.add('border-slate-300', 'dark:border-slate-600');
      }
    }
  }
}

// Dedicated Recharge Screen Submission (Connected to POST /api/recharge)
async function handleScreenRechargeSubmit(e) {
  if (e) e.preventDefault();
  const targetPhone = document.getElementById('screen-rec-phone')?.value.trim();
  const amount = parseFloat(document.getElementById('screen-rec-amount')?.value);
  const pin = state.screenRecPin;

  if (!targetPhone || targetPhone.length < 11) {
    showToast('সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন');
    return;
  }

  if (isNaN(amount) || amount < 20 || amount > 1000) {
    showToast('সর্বনিম্ন ২০ টাকা এবং সর্বোচ্চ ১,০০০ টাকা লিখুন');
    return;
  }

  if (!pin || pin.length < 5) {
    showToast('আপনার ৫ সংখ্যার সিক্রেট পিন দিন');
    return;
  }

  const submitBtn = document.getElementById('btn-screen-recharge-submit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = 'রিচার্জ প্রসেস হচ্ছে...';
  }

  const res = await apiRequest('/api/recharge', 'POST', {
    userPhone: state.user.phone,
    targetPhone,
    operator: operatorMeta[state.rechargeOperator]?.name || 'Grameenphone',
    amount,
    pin
  });

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>⚡</span> রিচার্জ করুন';
  }

  if (res.success) {
    state.user.rechargeBalance = res.newBalance;
    updateProfileUI();
    if (res.transaction) {
      state.transactions.unshift(res.transaction);
    }
    showToast(res.message);
    
    // Reset form
    document.getElementById('screen-rec-phone').value = '';
    document.getElementById('screen-rec-amount').value = '';
    const pinInput = document.getElementById('screen-rec-pin');
    if (pinInput) pinInput.value = '';
    state.screenRecPin = '';
    handleScreenRecPinInput({ value: '' });

    setTimeout(() => navigate('transactions'), 1200);
  } else {
    showToast(res.message || 'রিচার্জ সম্পন্ন করা যায়নি!');
  }
}

// Modal Recharge Fallback
async function handleRechargeSubmit(e) {
  e.preventDefault();
  const phone = document.getElementById('rec-phone').value;
  const amount = parseFloat(document.getElementById('rec-amount').value);
  const op = document.getElementById('rec-op').value;

  const res = await apiRequest('/api/recharge', 'POST', {
    userPhone: state.user.phone,
    targetPhone: phone,
    operator: op,
    amount,
    pin: '78900'
  });

  if (res.success) {
    state.user.rechargeBalance = res.newBalance;
    updateProfileUI();
    closeRechargeModal();
    showToast(res.message);
    navigate('transactions');
  } else {
    showToast(res.message);
  }
}

// Bill Payment Submission (POST /api/bill-pay)
async function handleBillPaymentSubmit(e) {
  e.preventDefault();
  const operator = document.getElementById('bill-operator').value;
  const billNo = document.getElementById('bill-number').value;
  const amount = parseFloat(document.getElementById('bill-amount').value);
  const mobile = document.getElementById('bill-mobile').value;
  const month = document.getElementById('bill-month').value;

  if (!operator || !billNo || isNaN(amount) || !mobile || !month) {
    showToast('অনুগ্রহ করে সকল তথ্য পূরণ করুন');
    return;
  }

  const res = await apiRequest('/api/bill-pay', 'POST', {
    userPhone: state.user.phone,
    biller: operator,
    billNumber: billNo,
    amount,
    month
  });

  if (res.success) {
    if (res.transaction) state.transactions.unshift(res.transaction);
    showToast(res.message);
    e.target.reset();
    setTimeout(() => navigate('transactions'), 1200);
  } else {
    showToast(res.message);
  }
}

// Register 3-Step Wizard Logic (Connected to POST /api/auth/register)
let regStep = 1;
function setRegStep(step) {
  regStep = step;
  const s1 = document.getElementById('reg-step-1');
  const s2 = document.getElementById('reg-step-2');
  const s3 = document.getElementById('reg-step-3');
  const ind = document.getElementById('reg-step-indicator');
  const pct = document.getElementById('reg-step-percent');
  const bar = document.getElementById('reg-progress-bar');
  const title = document.getElementById('reg-banner-title');
  const subtitle = document.getElementById('reg-banner-subtitle');

  if (s1) s1.classList.toggle('hidden', step !== 1);
  if (s2) s2.classList.toggle('hidden', step !== 2);
  if (s3) s3.classList.toggle('hidden', step !== 3);

  if (step === 1) {
    if (ind) ind.innerText = '1 / 3';
    if (pct) pct.innerText = '0%';
    if (bar) bar.style.width = '0%';
    if (title) title.innerText = 'নতুন একাউন্ট তৈরি করুন';
    if (subtitle) subtitle.innerText = 'আপনার মোবাইল নাম্বার দিন';
  } else if (step === 2) {
    if (ind) ind.innerText = '2 / 3';
    if (pct) pct.innerText = '50%';
    if (bar) bar.style.width = '50%';
    if (title) title.innerText = 'ওটিপি যাচাই করুন';
    if (subtitle) subtitle.innerText = 'মোবাইলে পাঠানো ওটিপি কোড এবং আপনার নাম দিন';
  } else if (step === 3) {
    if (ind) ind.innerText = '3 / 3';
    if (pct) pct.innerText = '100%';
    if (bar) bar.style.width = '100%';
    if (title) title.innerText = 'নিরাপত্তা পিন সেট করুন';
    if (subtitle) subtitle.innerText = '৫ সংখ্যার পিন এবং অ্যাকাউন্ট টাইপ নির্বাচন করুন';
  }
}

function handleRegPhoneInput(input) {
  const btn = document.getElementById('btn-reg-otp');
  if (btn) btn.disabled = input.value.trim().length < 11;
}

function handleRegSendOtp() {
  const phone = document.getElementById('reg-phone-input')?.value.trim();
  if (!phone || phone.length < 11) {
    showToast('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');
    return;
  }
  showToast(`${phone} নম্বরে ওটিপি কোড পাঠানো হয়েছে!`);
  setRegStep(2);
}

function handleRegStep2Next() {
  const name = document.getElementById('reg-fullname')?.value.trim();
  if (!name) {
    showToast('আপনার পূর্ণ নাম লিখুন');
    return;
  }
  setRegStep(3);
}

async function handleRegFinalSubmit() {
  const pin = document.getElementById('reg-pin')?.value.trim();
  const accType = document.getElementById('reg-account-type')?.value || 'retailer';
  const name = document.getElementById('reg-fullname')?.value.trim() || 'নতুন গ্রাহক';
  const phone = document.getElementById('reg-phone-input')?.value.trim() || '01934109081';

  if (!pin || pin.length < 5) {
    showToast('অনুগ্রহ করে ৫ সংখ্যার সিক্রেট পিন দিন');
    return;
  }

  showToast('রেজিস্ট্রেশন প্রসেস হচ্ছে...');
  const res = await apiRequest('/api/auth/register', 'POST', {
    phone,
    name,
    pin,
    role: accType
  });

  if (res.success && res.user) {
    state.isLoggedIn = true;
    state.user.name = res.user.name;
    state.user.phone = res.user.phone;
    state.user.role = res.user.role;
    state.user.rechargeBalance = res.user.rechargeBalance;
    localStorage.setItem('lucceass_logged_in', 'true');
    localStorage.setItem('lucceass_user_phone', res.user.phone);

    showToast('রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে! স্বাগতম।');
    setRegStep(1);
    updateProfileUI();
    navigate('dashboard');
    setTimeout(() => openNoticeModal(), 400);
  } else {
    showToast(res.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে!');
  }
}

// Operators & Packs rendering
function selectOperator(operatorKey) {
  state.selectedOperator = operatorKey;
  document.querySelectorAll('.operator-card').forEach(btn => btn.classList.remove('active'));
  const selectedBtn = document.getElementById(`op-card-${operatorKey}`);
  if (selectedBtn) selectedBtn.classList.add('active');
  renderPackages();
}

function filterPackCategory(category) {
  state.selectedPackCategory = category;
  document.querySelectorAll('.cat-pill').forEach(pill => pill.classList.remove('active'));
  const activePill = document.getElementById(`cat-pill-${category}`);
  if (activePill) activePill.classList.add('active');
  renderPackages();
}

function renderPackages() {
  const container = document.getElementById('packages-list-container');
  if (!container) return;

  const currentPacks = packagesDb[state.selectedOperator] || [];
  const filtered = state.selectedPackCategory === 'all' 
    ? currentPacks 
    : currentPacks.filter(p => p.category === state.selectedPackCategory);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-slate-400">
        <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
        <p class="font-medium text-sm">এই ক্যাটাগরিতে কোনো অফার পাওয়া যায়নি</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(pack => `
    <div onclick="openRechargeModalWithPack('${pack.title}', ${pack.price})" class="pack-row-card">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-slate-700 flex items-center justify-center p-2 flex-shrink-0">
          ${getOperatorIcon(state.selectedOperator)}
        </div>
        <div>
          <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug">${pack.title}</h4>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              pack.tag === 'বান্ডেল' ? 'bg-pink-100 text-[#F82769] dark:bg-pink-950 dark:text-pink-300' :
              pack.tag === 'ডাটা' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
              'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
            }">${pack.tag}</span>
            <span class="text-xs text-slate-400 font-medium">${pack.validity}</span>
          </div>
        </div>
      </div>
      <div class="text-right flex-shrink-0">
        <span class="text-lg font-extrabold text-[#F82769]">৳${pack.price}</span>
      </div>
    </div>
  `).join('');
}

function getOperatorIcon(op) {
  const meta = operatorMeta[op];
  if (meta && meta.icon) {
    return `<img src="${meta.icon}" alt="${meta.name}" class="w-8 h-8 object-contain">`;
  }
  return `<span class="uppercase text-xs font-black text-[#F82769]">${op}</span>`;
}

function openRechargeModalWithPack(packTitle, packPrice) {
  navigate('recharge');
  setRechargeAmount(packPrice);
  showToast(`${packTitle} নির্বাচন করা হয়েছে`);
}

// Transactions Filter & Render
function renderTransactions() {
  const container = document.getElementById('transactions-list-container');
  if (!container) return;

  const searchQuery = document.getElementById('tx-search-input')?.value.trim() || '';
  const activeFilter = document.querySelector('.tx-filter-pill.active')?.dataset.filter || 'all';

  let list = state.transactions;
  if (activeFilter !== 'all') {
    list = list.filter(t => t.type === activeFilter);
  }
  if (searchQuery) {
    list = list.filter(t => t.number.includes(searchQuery) || t.id.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center shadow-sm border border-slate-100 dark:border-slate-700/60 my-6">
        <div class="w-16 h-16 rounded-full bg-pink-50 dark:bg-slate-700/60 flex items-center justify-center mx-auto mb-3 text-[#F82769]">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
        </div>
        <p class="text-slate-600 dark:text-slate-300 font-semibold text-base">কোনো লেনদেন নেই!</p>
        <p class="text-xs text-slate-400 mt-1">আপনার পূর্ববর্তী লেনদেনের তালিকা এখানে দেখতে পাবেন</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(tx => `
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/60 flex items-center justify-between mb-3 hover:shadow-md transition">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl ${tx.type === 'recharge' ? 'bg-pink-100 text-[#F82769]' : tx.type === 'drive' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'} flex items-center justify-center font-bold text-sm">
          ${tx.type === 'recharge' ? '📱' : tx.type === 'drive' ? '🏷️' : '🧾'}
        </div>
        <div>
          <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm">${tx.number}</h4>
          <p class="text-xs text-slate-400">${tx.operator} • ${tx.date}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="font-bold text-slate-900 dark:text-white text-base">৳${tx.amount}</p>
        <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${tx.status === 'সফল' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700'}">${tx.status}</span>
      </div>
    </div>
  `).join('');
}

function filterTxTab(filterType, element) {
  document.querySelectorAll('.tx-filter-pill').forEach(el => {
    el.classList.remove('active', 'bg-[#F82769]', 'text-white');
    el.classList.add('bg-white', 'text-slate-700', 'dark:bg-slate-800', 'dark:text-slate-300');
    delete el.dataset.filter;
  });

  element.classList.add('active', 'bg-[#F82769]', 'text-white');
  element.classList.remove('bg-white', 'text-slate-700', 'dark:bg-slate-800', 'dark:text-slate-300');
  element.dataset.filter = filterType;
  renderTransactions();
}

// Drawer Sidebar Navigation
function openDrawer() {
  const drawer = document.getElementById('drawer-menu');
  const overlay = document.getElementById('drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
  }
}

function closeDrawer() {
  const drawer = document.getElementById('drawer-menu');
  const overlay = document.getElementById('drawer-overlay');
  if (drawer && overlay && !overlay.classList.contains('hidden')) {
    drawer.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
  }
}

// Dark Mode Toggle
function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  state.theme = isDark ? 'dark' : 'light';
  localStorage.setItem('lucceass_theme', state.theme);
  
  const toggleBtn = document.getElementById('theme-toggle-switch');
  if (toggleBtn) toggleBtn.checked = isDark;
  showToast(`ডার্ক মোড ${isDark ? 'চালু' : 'বন্ধ'} করা হয়েছে`);
}

// Color Theme Management (Default Red, Black, Blue, Yellow)
function setColorTheme(themeName) {
  const validThemes = ['default', 'black', 'blue', 'yellow'];
  if (!validThemes.includes(themeName)) themeName = 'default';

  state.colorTheme = themeName;
  localStorage.setItem('lucceass_color_theme', themeName);

  if (themeName === 'default') {
    document.documentElement.removeAttribute('data-color-theme');
  } else {
    document.documentElement.setAttribute('data-color-theme', themeName);
  }

  updateThemeSelectorUI(themeName);
  showToast(`থিম পরিবর্তন করা হয়েছে: ${getThemeDisplayName(themeName)}`);
}

function getThemeDisplayName(themeName) {
  switch (themeName) {
    case 'black': return 'ব্ল্যাক (Black)';
    case 'blue': return 'ব্লু (Royal Blue)';
    case 'yellow': return 'ইয়েলো (Golden Yellow)';
    default: return 'ডিফল্ট রেড (Default Red)';
  }
}

function updateThemeSelectorUI(themeName) {
  const validThemes = ['default', 'black', 'blue', 'yellow'];
  validThemes.forEach(t => {
    const btn = document.getElementById(`theme-btn-${t}`);
    if (btn) {
      const checkIcon = btn.querySelector('.theme-check-icon');
      if (t === themeName) {
        btn.classList.add('active');
        if (checkIcon) checkIcon.classList.remove('hidden');
      } else {
        btn.classList.remove('active');
        if (checkIcon) checkIcon.classList.add('hidden');
      }
    }
  });

  const badge = document.getElementById('current-theme-badge');
  if (badge) badge.textContent = getThemeDisplayName(themeName);

  const settingsLabel = document.getElementById('settings-theme-label');
  if (settingsLabel) settingsLabel.textContent = getThemeDisplayName(themeName);
}

function initColorTheme() {
  const saved = localStorage.getItem('lucceass_color_theme') || 'default';
  state.colorTheme = saved;
  if (saved !== 'default') {
    document.documentElement.setAttribute('data-color-theme', saved);
  } else {
    document.documentElement.removeAttribute('data-color-theme');
  }
  updateThemeSelectorUI(saved);
}

function scrollToThemeSection() {
  const section = document.getElementById('theme-selection-card');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Toast Notifications
function showToast(message) {
  const toast = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.add('opacity-0', 'pointer-events-none', '-translate-y-4');
    toast.classList.remove('opacity-100', 'translate-y-0');
  }, 3000);
}

// Modals
function openRechargeModal() {
  navigate('recharge');
}

function closeRechargeModal() {
  const modal = document.getElementById('recharge-modal');
  if (modal) modal.classList.add('hidden');
}

function openAddMoneyModal() {
  const modal = document.getElementById('add-money-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeAddMoneyModal() {
  const modal = document.getElementById('add-money-modal');
  if (modal) modal.classList.add('hidden');
}

async function submitAddMoney(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('add-amount')?.value);
  const trxId = document.getElementById('add-trxid')?.value?.trim();
  const method = document.getElementById('add-method')?.value || 'bKash';

  if (!state.user.phone) {
    showToast('দয়া করে প্রথমে লগইন করুন');
    closeAddMoneyModal();
    navigate('login');
    return;
  }

  if (isNaN(amount) || amount < 50 || !trxId) {
    showToast('সঠিক তথ্য, TrxID ও সর্বনিম্ন ৫০ টাকা দিন');
    return;
  }

  showToast('ডিপোজিট রিকোয়েস্ট পাঠানো হচ্ছে...');
  const res = await apiRequest('/api/deposit', 'POST', {
    userPhone: state.user.phone,
    method,
    amount,
    trxId,
    targetBalance: 'recharge'
  });

  if (res.success) {
    closeAddMoneyModal();
    e.target.reset();
    showToast('অ্যাড মানি রিকোয়েস্ট সফলভাবে জমা হয়েছে! অ্যাডমিন অনুমোদন করলে ব্যালেন্স যুক্ত হবে।');
  } else {
    showToast(res.message || 'ডিপোজিট রিকোয়েস্ট ব্যর্থ হয়েছে');
  }
}

// Application Initialization
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize color palette theme
  initColorTheme();

  if (state.theme === 'dark') {
    document.documentElement.classList.add('dark');
    const toggleBtn = document.getElementById('theme-toggle-switch');
    if (toggleBtn) toggleBtn.checked = true;
  }

  // Clear PIN on startup
  state.pinInput = '';
  updatePinDots();

  // If authenticated user phone exists in storage, fetch live data; else show Landing Welcome Page
  const savedPhone = localStorage.getItem('lucceass_user_phone');
  if (state.isLoggedIn && savedPhone) {
    state.user.phone = savedPhone;
    await fetchUserProfile();
    await fetchTransactions();
    navigate('dashboard');
  } else {
    state.isLoggedIn = false;
    localStorage.removeItem('lucceass_logged_in');
    localStorage.removeItem('lucceass_user_phone');
    navigate('landing');
  }
});
