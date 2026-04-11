export type Lang = 'bn' | 'en'

export const translations = {
  // ── App ──────────────────────────────────────────────────────────
  appName:      { en: 'Bari Shamlai', bn: 'বাড়ি সামলাই' },
  appTagline:   { en: 'Building Management System', bn: 'ভবন ব্যবস্থাপনা সিস্টেম' },

  // ── Language toggle ──────────────────────────────────────────────
  switchToEn:   { en: 'English', bn: 'English' },
  switchToBn:   { en: 'বাংলা', bn: 'বাংলা' },

  // ── Auth — Login ─────────────────────────────────────────────────
  loginWelcome:    { en: 'Welcome back', bn: 'আবার স্বাগতম' },
  loginSubtitle:   { en: 'Sign in to your account', bn: 'অ্যাকাউন্টে লগইন করুন' },
  loginEmail:      { en: 'Email address', bn: 'ইমেইল ঠিকানা' },
  loginPassword:   { en: 'Password', bn: 'পাসওয়ার্ড' },
  loginSubmit:     { en: 'Sign in', bn: 'লগইন করুন' },
  loginSigning:    { en: 'Signing in…', bn: 'লগইন হচ্ছে…' },
  loginError:      { en: 'Invalid email or password', bn: 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে' },
  loginNewUser:    { en: 'New resident?', bn: 'নতুন ব্যবহারকারী?' },
  loginCreateAcc:  { en: 'Create an account', bn: 'অ্যাকাউন্ট খুলুন' },

  // ── Auth — Signup ────────────────────────────────────────────────
  signupTitle:        { en: 'Create account', bn: 'অ্যাকাউন্ট খুলুন' },
  signupSubtitle:     { en: 'Choose your role to get started', bn: 'আপনার ভূমিকা বেছে নিন' },
  signupPlatform:     { en: 'Building Management Platform', bn: 'ভবন ব্যবস্থাপনা প্ল্যাটফর্ম' },
  roleAdmin:          { en: 'Admin', bn: 'অ্যাডমিন' },
  roleAdminSub:       { en: 'Manage a building', bn: 'ভবন পরিচালনা করি' },
  roleOwner:          { en: 'Owner', bn: 'মালিক' },
  roleOwnerSub:       { en: 'I own a flat', bn: 'ফ্ল্যাটের মালিক আমি' },
  roleTenant:         { en: 'Tenant', bn: 'ভাড়াটে' },
  roleTenantSub:      { en: 'I rent a flat', bn: 'ভাড়া থাকি' },
  joinHow:            { en: 'How would you like to join?', bn: 'কীভাবে যোগ দিতে চান?' },
  joinInvitation:     { en: 'I have an invitation', bn: 'আমন্ত্রণ আছে আমার কাছে' },
  joinInvitationSub:  { en: 'Admin sent you a token', bn: 'অ্যাডমিন আপনাকে টোকেন দিয়েছেন' },
  joinRequest:        { en: 'Join with Building ID', bn: 'Building ID দিয়ে যোগ দিন' },
  joinRequestSub:     { en: 'Admin will approve you', bn: 'অ্যাডমিন অনুমোদন করবেন' },
  buildingName:       { en: 'Building Name', bn: 'ভবনের নাম' },
  buildingPlaceholder: { en: 'e.g. Octova Tower, Green Heights…', bn: 'যেমন: অক্টোভা টাওয়ার, গ্রিন হাইটস…' },
  buildingWorkspace:  { en: 'Creates a new isolated workspace for your building.', bn: 'আপনার ভবনের জন্য আলাদা একটি workspace তৈরি হবে।' },
  invitationToken:    { en: 'Invitation Token', bn: 'আমন্ত্রণ টোকেন' },
  invitationPaste:    { en: 'Paste the token your admin shared', bn: 'অ্যাডমিনের দেওয়া টোকেনটি পেস্ট করুন' },
  invitationInstant:  { en: 'You will be approved instantly.', bn: 'সাথে সাথে অনুমোদন পাবেন।' },
  fieldBuildingId:    { en: 'Building ID', bn: 'Building ID' },
  buildingIdPlaceholder: { en: 'Ask your building admin for the ID', bn: 'অ্যাডমিনের কাছ থেকে ID নিন' },
  requestApproval:    { en: 'Your request will be sent to the admin for approval.', bn: 'আপনার আবেদন অ্যাডমিনের কাছে যাবে।' },
  fieldFullName:      { en: 'Full Name', bn: 'পুরো নাম' },
  fieldEmail:         { en: 'Email Address', bn: 'ইমেইল ঠিকানা' },
  fieldPhone:         { en: 'Phone (optional)', bn: 'ফোন (ঐচ্ছিক)' },
  fieldPassword:      { en: 'Password', bn: 'পাসওয়ার্ড' },
  fieldConfirm:       { en: 'Confirm', bn: 'নিশ্চিত করুন' },
  fieldMinChars:      { en: 'Min. 6 chars', bn: 'কমপক্ষে ৬ অক্ষর' },
  fieldRepeat:        { en: 'Repeat', bn: 'আবার লিখুন' },
  signupCreateBuilding: { en: 'Create Building & Account', bn: 'ভবন ও অ্যাকাউন্ট তৈরি করুন' },
  signupJoin:         { en: 'Join Building', bn: 'ভবনে যোগ দিন' },
  signupSendRequest:  { en: 'Send Join Request', bn: 'যোগদানের আবেদন পাঠান' },
  signupCreating:     { en: 'Creating…', bn: 'তৈরি হচ্ছে…' },
  signupHaveAccount:  { en: 'Already have an account?', bn: 'আগে থেকে অ্যাকাউন্ট আছে?' },
  signupSignIn:       { en: 'Sign in', bn: 'লগইন করুন' },
  errPasswordMatch:   { en: 'Passwords do not match', bn: 'পাসওয়ার্ড দুটো মিলছে না' },
  errBuildingRequired: { en: 'Building name is required', bn: 'ভবনের নাম দিতে হবে' },
  errEnterToken:      { en: 'Please enter your invitation token', bn: 'আমন্ত্রণ টোকেনটি দিন' },
  errEnterBuildingId: { en: 'Please enter the Building ID', bn: 'Building ID দিন' },
  errSignupFailed:    { en: 'Signup failed', bn: 'অ্যাকাউন্ট তৈরি হয়নি' },
  pendingTitle:       { en: 'Request Submitted!', bn: 'আবেদন পাঠানো হয়েছে!' },
  pendingBody:        { en: 'Your request to join {building} has been sent to the building admin for approval. You will be able to log in once your request is approved.', bn: '{building}-এ যোগ দেওয়ার আবেদন অ্যাডমিনের কাছে পাঠানো হয়েছে। অনুমোদন পেলে লগইন করতে পারবেন।' },
  backToLogin:        { en: 'Back to Login', bn: 'লগইনে ফিরুন' },

  // ── Sidebar / Navigation ─────────────────────────────────────────
  navDashboard:     { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
  navBilling:       { en: 'Billing', bn: 'বিলিং' },
  navServiceCharge: { en: 'Service Charge', bn: 'সার্ভিস চার্জ' },
  navExpenses:      { en: 'Expenses', bn: 'খরচ' },
  navGasBills:      { en: 'Gas Bills', bn: 'গ্যাস বিল' },
  navReceipts:      { en: 'Receipts', bn: 'রসিদ' },
  navMessages:      { en: 'Messages', bn: 'বার্তা' },
  navUnits:         { en: 'Units', bn: 'ফ্ল্যাট' },
  navReports:       { en: 'Reports', bn: 'রিপোর্ট' },
  navSettings:      { en: 'Settings', bn: 'সেটিংস' },
  navSection:       { en: 'Navigation', bn: 'নেভিগেশন' },
  navSignOut:       { en: 'Sign out', bn: 'বের হন' },
  navSigningOut:    { en: 'Signing out…', bn: 'বের হচ্ছেন…' },
  navFreePlan:      { en: 'Free Plan', bn: 'ফ্রি প্ল্যান' },
  navUpgrade:       { en: 'Upgrade →', bn: 'আপগ্রেড →' },
  navApartmentMgmt: { en: 'Apartment management', bn: 'অ্যাপার্টমেন্ট ব্যবস্থাপনা' },

  // ── Dashboard — common ──────────────────────────────────────────
  dashGreeting:     { en: 'Good day', bn: 'শুভ দিন' },
  dashOverview:     { en: 'Building Management Overview', bn: 'ভবন ব্যবস্থাপনার সংক্ষিপ্ত বিবরণ' },
  dashTotalUnits:   { en: 'Total Units', bn: 'মোট ফ্ল্যাট' },
  dashCollected:    { en: 'Collected This Month', bn: 'এই মাসে আদায়' },
  dashPending:      { en: 'Pending Bills', bn: 'বকেয়া বিল' },
  dashExpenses:     { en: 'Total Expenses', bn: 'মোট খরচ' },
  dashThisMonth:    { en: 'This month', bn: 'এই মাসে' },
  dashOverdue:      { en: 'overdue', bn: 'মেয়াদোত্তীর্ণ' },
  dashOccupancy:    { en: 'Occupancy Status', bn: 'বসবাসের অবস্থা' },
  dashOccupied:     { en: 'Occupied', bn: 'বসবাসকৃত' },
  dashVacant:       { en: 'Vacant', bn: 'খালি' },
  dashOccupancyPct: { en: 'occupancy', bn: 'বসবাস' },
  dashQuickLinks:   { en: 'Quick Links', bn: 'দ্রুত লিংক' },
  dashMonthBills:   { en: "This Month's Bills", bn: 'এই মাসের বিল' },
  dashRecentMsg:    { en: 'Recent Messages', bn: 'সাম্প্রতিক বার্তা' },
  dashViewAll:      { en: 'View all →', bn: 'সব দেখুন →' },
  dashCompose:      { en: 'Compose →', bn: 'লিখুন →' },
  dashNoMessages:   { en: 'No messages yet', bn: 'কোনো বার্তা নেই' },
  dashAddBill:      { en: '+ Add Bill', bn: '+ বিল যোগ করুন' },
  dashGasMatrix:    { en: 'Gas Matrix', bn: 'গ্যাস ম্যাট্রিক্স' },
  dashAddExpense:   { en: '+ Expense', bn: '+ খরচ' },
  dashManageUnits:  { en: 'Manage Units', bn: 'ফ্ল্যাট পরিচালনা' },
  dashNoUnit:       { en: 'No unit assigned yet. Contact the admin.', bn: 'এখনো কোনো ফ্ল্যাট নির্ধারিত হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন।' },
  dashNoUnitTenant: { en: 'No unit assigned. Contact the building admin.', bn: 'কোনো ফ্ল্যাট নির্ধারিত হয়নি। বিল্ডিং অ্যাডমিনের সাথে যোগাযোগ করুন।' },

  // ── Dashboard — table headers ───────────────────────────────────
  colUnit:          { en: 'Unit', bn: 'ফ্ল্যাট' },
  colType:          { en: 'Type', bn: 'ধরন' },
  colAmount:        { en: 'Amount', bn: 'পরিমাণ' },
  colStatus:        { en: 'Status', bn: 'অবস্থা' },
  colMonth:         { en: 'Month', bn: 'মাস' },
  colTo:            { en: 'To', bn: 'প্রাপক' },
  colSent:          { en: 'Sent', bn: 'পাঠানো হয়েছে' },
  colFloor:         { en: 'Floor', bn: 'তলা' },
  colDirect:        { en: 'Direct', bn: 'সরাসরি' },
  colAllRes:        { en: '🌐 All', bn: '🌐 সবাই' },

  // ── Dashboard — owner/tenant ───────────────────────────────────
  dashUnit:           { en: 'Unit', bn: 'ফ্ল্যাট' },
  dashMonthlyRent:    { en: 'Monthly Rent', bn: 'মাসিক ভাড়া' },
  dashPendingBills:   { en: 'Pending Bills', bn: 'বকেয়া বিল' },
  dashAwaitPayment:   { en: 'Awaiting payment', bn: 'পরিশোধের অপেক্ষায়' },
  dashTenant:         { en: 'Tenant', bn: 'ভাড়াটে' },
  dashNoTenant:       { en: 'No tenant', bn: 'কোনো ভাড়াটে নেই' },
  dashRecentBills:    { en: 'Recent Bills', bn: 'সাম্প্রতিক বিল' },
  dashIssuedReceipts: { en: 'Issued Receipts', bn: 'প্রদত্ত রসিদ' },
  dashYourUnit:       { en: 'Your Unit', bn: 'আপনার ফ্ল্যাট' },
  dashYourBills:      { en: 'Your Bills', bn: 'আপনার বিল' },
  dashPendingPayments: { en: 'Pending Payments', bn: 'বকেয়া পেমেন্ট' },
  dashMessages:       { en: 'Messages', bn: 'বার্তা' },
  dashFrom:           { en: 'From', bn: 'প্রেরক' },

  // ── Bill types ──────────────────────────────────────────────────
  billRent:    { en: 'Rent', bn: 'ভাড়া' },
  billSC:      { en: 'Service Charge', bn: 'সার্ভিস চার্জ' },
  billGas:     { en: 'Gas Bill', bn: 'গ্যাস বিল' },
  billOther:   { en: 'Other', bn: 'অন্যান্য' },

  // ── Bill status ─────────────────────────────────────────────────
  statusPaid:    { en: 'Paid', bn: 'পরিশোধিত' },
  statusPending: { en: 'Pending', bn: 'বকেয়া' },
  statusOverdue: { en: 'Overdue', bn: 'মেয়াদোত্তীর্ণ' },

  // ── Months ──────────────────────────────────────────────────────
  month1:  { en: 'January',   bn: 'জানুয়ারি' },
  month2:  { en: 'February',  bn: 'ফেব্রুয়ারি' },
  month3:  { en: 'March',     bn: 'মার্চ' },
  month4:  { en: 'April',     bn: 'এপ্রিল' },
  month5:  { en: 'May',       bn: 'মে' },
  month6:  { en: 'June',      bn: 'জুন' },
  month7:  { en: 'July',      bn: 'জুলাই' },
  month8:  { en: 'August',    bn: 'আগস্ট' },
  month9:  { en: 'September', bn: 'সেপ্টেম্বর' },
  month10: { en: 'October',   bn: 'অক্টোবর' },
  month11: { en: 'November',  bn: 'নভেম্বর' },
  month12: { en: 'December',  bn: 'ডিসেম্বর' },

  // ── Landing — Navbar ────────────────────────────────────────────
  landNavFeatures:   { en: 'Features', bn: 'বৈশিষ্ট্য' },
  landNavPricing:    { en: 'Pricing', bn: 'মূল্য' },
  landNavHowItWorks: { en: 'How It Works', bn: 'কীভাবে কাজ করে' },
  landNavFAQ:        { en: 'FAQ', bn: 'প্রশ্নোত্তর' },
  landSignIn:        { en: 'Sign in', bn: 'লগইন' },
  landGetStarted:    { en: 'Get Started Free', bn: 'ফ্রিতে শুরু করুন' },
  landGetStartedMob: { en: 'Get Started', bn: 'শুরু করুন' },

  // ── Landing — Hero ──────────────────────────────────────────────
  landHeroBadge:     { en: 'BUILT FOR BANGLADESH\'S APARTMENT MANAGERS', bn: 'বাংলাদেশের অ্যাপার্টমেন্ট ম্যানেজারদের জন্য' },
  landHeroH1:        { en: 'Manage every flat, every floor, every month.', bn: 'প্রতিটি ফ্ল্যাট, প্রতিটি তলা, প্রতি মাস — সামলাই।' },
  landHeroSub:       { en: 'Bari Shamlai replaces your rent notebook, WhatsApp group, and spreadsheet with one clean platform. Bills, payments, gas, service charge — automated.', bn: 'ভাড়ার খাতা, WhatsApp গ্রুপ আর Excel ফাইল — সব ছেড়ে দিন। বাড়ি সামলাই-এ বিল, পেমেন্ট, গ্যাস, সার্ভিস চার্জ — সব হয় এক জায়গায়।' },
  landStartFree:     { en: 'Start Free — No Card Required', bn: 'ফ্রিতে শুরু করুন — কার্ড লাগবে না' },
  landSeeHow:        { en: 'See how it works', bn: 'কীভাবে কাজ করে' },
  landTrustCard:     { en: 'No credit card', bn: 'কার্ড লাগবে না' },
  landTrustSetup:    { en: '5-min setup', bn: '৫ মিনিটে রেডি' },
  landTrustBD:       { en: 'Made for BD', bn: 'বাংলাদেশের জন্য' },

  // ── Landing — Stats ─────────────────────────────────────────────
  landStatBuildings: { en: 'Buildings using Bari Shamlai', bn: 'ভবন ব্যবহার করছে' },
  landStatHours:     { en: 'Hours saved per manager/month', bn: 'বাঁচে প্রতি মাসে' },
  landStatPayment:   { en: 'On-time payment rate', bn: 'ভাড়া সময়মতো আসে' },
  landStatMinutes:   { en: 'Minutes to set up', bn: 'এ শুরু করা যায়' },

  // ── Landing — Pain Points ────────────────────────────────────────
  landPainHeader:    { en: 'SOUND FAMILIAR?', bn: 'চেনা লাগছে?' },
  landPainTitle:     { en: "Managing a building shouldn't feel like this", bn: 'বাড়ি ম্যানেজ করা এত কঠিন কেন?' },
  landPain1Title:    { en: 'The rent notebook', bn: 'ভাড়ার খাতা' },
  landPain1Desc:     { en: "Crossed-out entries, smudged names, disputes over what was actually paid. One torn page and it's gone.", bn: 'কাটাকাটি, অস্পষ্ট লেখা, কে কত দিয়েছে তা নিয়ে ঝগড়া। একটা পাতা ছিঁড়ে গেলেই সব শেষ।' },
  landPain2Title:    { en: 'WhatsApp chaos', bn: 'WhatsApp-এর যন্ত্রণা' },
  landPain2Desc:     { en: '"Did you pay?" texts every month — followed by arguments, excuses, and no paper trail.', bn: '"পেমেন্ট করেছেন?" — প্রতি মাসে একই মেসেজ, তারপর তর্ক আর কোনো প্রমাণ নেই।' },
  landPain3Title:    { en: 'Spreadsheet Pain', bn: 'Spreadsheet-এর জ্বালা' },
  landPain3Desc:     { en: 'Your gas bill formula broke again. Version 17 of the month-end Excel — sent to the wrong group.', bn: 'গ্যাস বিলের ফর্মুলা আবার ভেঙে গেছে। মাসশেষের Excel-এর ১৭তম ভার্সন — ভুল গ্রুপে পাঠানো হয়েছে।' },
  landPain4Title:    { en: 'Receipt disputes', bn: 'রসিদের ঝগড়া' },
  landPain4Desc:     { en: 'Tenant swears they paid. You have no proof. The argument takes an hour. Trust is lost permanently.', bn: 'ভাড়াটে বলছেন দিয়েছেন। আপনার কাছে প্রমাণ নেই। এক ঘণ্টার তর্ক। বিশ্বাস চিরতরে শেষ।' },
  landPain5Title:    { en: 'Gas split confusion', bn: 'গ্যাস ভাগাভাগির ঝামেলা' },
  landPain5Desc:     { en: "Calculating each flat's gas share from meter readings takes three hours and still causes disagreements.", bn: 'মিটার রিডিং দেখে প্রতিটি ফ্ল্যাটের গ্যাস বের করতে তিন ঘণ্টা — তারপরও মতবিরোধ।' },
  landPain6Title:    { en: 'No visibility', bn: 'কিছুই জানা নেই' },
  landPain6Desc:     { en: "You're not sure who's paid, who owes what, or what the building actually earned this month.", bn: 'কে দিয়েছেন, কে বাকি রেখেছেন, এই মাসে কত আয় হলো — সব অন্ধকার।' },

  // ── Landing — Features ──────────────────────────────────────────
  landFeatHeader:    { en: 'EVERYTHING YOU NEED', bn: 'সব আছে এখানে' },
  landFeatTitle:     { en: 'One platform. Every task handled.', bn: 'একটাই প্ল্যাটফর্ম। সব কাজ।' },
  landFeat1Title:    { en: 'Unit & Floor Map', bn: 'ফ্ল্যাট ও তলার ম্যাপ' },
  landFeat1Desc:     { en: "See every flat at a glance. Live floor map shows who's paid and who hasn't — color-coded, clickable, real-time.", bn: 'এক নজরে সব ফ্ল্যাট দেখুন। কে দিয়েছেন, কে দেননি — রঙে বোঝা যায়, ক্লিক করেই জানা যায়, সব রিয়েল-টাইম।' },
  landFeat2Title:    { en: 'Automated Billing', bn: 'স্বয়ংক্রিয় বিলিং' },
  landFeat2Desc:     { en: 'Generate monthly rent bills with one click. Log payments instantly. No spreadsheet, no notebook.', bn: 'এক ক্লিকে মাসিক বিল তৈরি। পেমেন্ট এলে সাথে সাথে নথিভুক্ত। খাতা বা Excel আর দরকার নেই।' },
  landFeat3Title:    { en: 'Digital PDF Receipts', bn: 'ডিজিটাল PDF রসিদ' },
  landFeat3Desc:     { en: 'Issue professional receipts the moment payment is logged. Delivered via email automatically. No disputes.', bn: 'পেমেন্ট হলেই রসিদ তৈরি। ইমেইলে আপনাআপনি চলে যায়। আর কোনো বিবাদ নেই।' },
  landFeat4Title:    { en: 'Gas & Utility Matrix', bn: 'গ্যাস ও ইউটিলিটি হিসাব' },
  landFeat4Desc:     { en: "Enter meter readings — Bari Shamlai calculates each unit's exact share automatically. Accurate, auditable, instant.", bn: 'মিটার রিডিং দিন — বাড়ি সামলাই প্রতিটি ফ্ল্যাটের ভাগ নিজেই বের করে দেয়। নির্ভুল, তাৎক্ষণিক।' },
  landFeat5Title:    { en: 'Building Announcements', bn: 'ভবনের নোটিশ' },
  landFeat5Desc:     { en: 'Send notices to one tenant or the entire building. Instant, documented, no WhatsApp group chaos.', bn: 'একজনকে বা পুরো ভবনকে নোটিশ দিন। WhatsApp গ্রুপের ঝামেলা নেই, সব নথিভুক্ত।' },
  landFeat6Title:    { en: 'Monthly Financial Reports', bn: 'মাসিক আর্থিক সারসংক্ষেপ' },
  landFeat6Desc:     { en: 'Income, expenses, outstanding dues — a complete summary that writes itself every month.', bn: 'আয়, খরচ, বকেয়া — সব মিলিয়ে একটা রিপোর্ট প্রতি মাসে আপনাআপনি তৈরি হয়ে যায়।' },

  // ── Landing — How It Works ───────────────────────────────────────
  landHowHeader:   { en: 'SIMPLE BY DESIGN', bn: 'ব্যবহার করা সহজ' },
  landHowTitle:    { en: 'Up and running in 3 steps', bn: 'মাত্র ৩ ধাপে শুরু' },
  landStep1Title:  { en: 'Set up your building', bn: 'ভবন সেটআপ করুন' },
  landStep1Desc:   { en: 'Add your building name, enter each flat and floor, set monthly rent and charges. Takes under 5 minutes.', bn: 'ভবনের নাম, প্রতিটি ফ্ল্যাট ও তলা, মাসিক ভাড়া — সব দিন। ৫ মিনিটেরও কম লাগে।' },
  landStep2Title:  { en: 'Invite your residents', bn: 'বাসিন্দাদের ডাকুন' },
  landStep2Desc:   { en: 'Each owner and tenant gets their own login. They see only their unit — their bills, their receipts, their history.', bn: 'প্রতিটি মালিক ও ভাড়াটে আলাদা লগইন পাবেন। তারা শুধু নিজেদের ফ্ল্যাট দেখবেন — বিল, রসিদ, সব।' },
  landStep3Title:  { en: 'Run on autopilot', bn: 'বাকিটা আপনা-আপনি' },
  landStep3Desc:   { en: 'Generate bills, collect payments, issue receipts, track gas — automated every month. Your job just got simpler.', bn: 'বিল তৈরি, পেমেন্ট নেওয়া, রসিদ দেওয়া, গ্যাস ট্র্যাক — সব মাসে মাসে চলে। আপনার কাজ অনেক কমে গেল।' },

  // ── Landing — Pricing ────────────────────────────────────────────
  landPricingHeader:  { en: 'PRICING', bn: 'মূল্য তালিকা' },
  landPricingTitle:   { en: 'Pick a plan. Pay monthly.', bn: 'একটা প্ল্যান নিন। মাসে মাসে দিন।' },
  landPricingSub:     { en: 'Start free. Upgrade when your building grows. No contracts, no hidden fees.', bn: 'ফ্রিতে শুরু করুন। বাড়তে থাকলে আপগ্রেড করুন। কোনো চুক্তি নেই, লুকানো চার্জ নেই।' },
  landStarterName:    { en: 'STARTER', bn: 'STARTER' },
  landStarterFree:    { en: 'Free', bn: 'Free' },
  landStarterNote:    { en: 'Forever · Up to 5 units · No card required', bn: 'সবসময় ফ্রি · সর্বোচ্চ ৫ ফ্ল্যাট · কার্ড লাগবে না' },
  landStarterCTA:     { en: 'Start Free →', bn: 'Start Free →' },
  landPopular:        { en: 'MOST POPULAR', bn: 'সবচেয়ে জনপ্রিয়' },
  landPerMonth:       { en: '/mo', bn: '/মাস' },
  landGetPlan:        { en: 'Get', bn: 'Get' },
  landLockNote:       { en: 'Gas bills, Receipts, and Messages are locked on the Free plan', bn: 'গ্যাস বিল, রসিদ আর মেসেজ ফ্রি প্ল্যানে পাওয়া যায় না' },
  landPremiumNote:    { en: 'All premium plans are activated by your account manager within 24 hours', bn: 'প্রিমিয়াম প্ল্যান ২৪ ঘণ্টার মধ্যে চালু করা হয়' },
  landUpgradeLater:   { en: 'Start with Starter, upgrade later →', bn: 'Starter দিয়ে শুরু করুন, পরে আপগ্রেড করুন →' },
  landSF1:            { en: 'Monthly billing & rent tracking', bn: 'মাসিক বিলিং ও ভাড়া ট্র্যাকিং' },
  landSF2:            { en: 'Service charge collection', bn: 'সার্ভিস চার্জ সংগ্রহ' },
  landSF3:            { en: 'Building expenses', bn: 'ভবনের খরচ' },
  landSF4:            { en: 'Basic dashboard & floor map', bn: 'মৌলিক ড্যাশবোর্ড ও ফ্লোর ম্যাপ' },

  // plan features
  landPF_basic1:   { en: 'Everything in Starter', bn: 'Starter-এর সব সুবিধা' },
  landPF_basic2:   { en: 'Gas & utility matrix', bn: 'গ্যাস ও ইউটিলিটি হিসাব' },
  landPF_basic3:   { en: 'Digital PDF receipts', bn: 'ডিজিটাল PDF রসিদ' },
  landPF_basic4:   { en: 'In-app messaging', bn: 'অ্যাপের মধ্যে মেসেজিং' },
  landPF_basic5:   { en: 'Monthly financial reports', bn: 'মাসিক আর্থিক রিপোর্ট' },
  landPF_std1:     { en: 'Everything in Basic', bn: 'Basic-এর সব সুবিধা' },
  landPF_std2:     { en: 'Multi-floor visual map', bn: 'মাল্টি-ফ্লোর ভিজ্যুয়াল ম্যাপ' },
  landPF_std3:     { en: 'Invitation system', bn: 'আমন্ত্রণ পাঠানোর সুবিধা' },
  landPF_std4:     { en: 'Expense analytics', bn: 'খরচের বিশ্লেষণ' },
  landPF_std5:     { en: 'Priority support', bn: 'অগ্রাধিকার সাপোর্ট' },
  landPF_pro1:     { en: 'Everything in Standard', bn: 'Standard-এর সব সুবিধা' },
  landPF_pro2:     { en: 'Advanced reports', bn: 'বিস্তারিত রিপোর্ট' },
  landPF_pro3:     { en: 'Bulk billing', bn: 'একসাথে অনেক বিল' },
  landPF_pro4:     { en: 'Custom rent cycles', bn: 'কাস্টম ভাড়ার সময়সূচি' },
  landPF_pro5:     { en: 'Dedicated account support', bn: 'ডেডিকেটেড সাপোর্ট' },
  landPF_ent1:     { en: 'Everything in Pro', bn: 'Pro-র সব সুবিধা' },
  landPF_ent2:     { en: 'Unlimited units', bn: 'সীমাহীন ফ্ল্যাট' },
  landPF_ent3:     { en: 'Multi-building dashboard', bn: 'একাধিক ভবনের ড্যাশবোর্ড' },
  landPF_ent4:     { en: 'Custom branding', bn: 'কাস্টম ব্র্যান্ডিং' },
  landPF_ent5:     { en: 'SLA guarantee', bn: 'SLA গ্যারান্টি' },

  // ── Landing — Testimonials ───────────────────────────────────────
  landTestHeader:  { en: 'TESTIMONIALS', bn: 'তারা কী বলেন' },
  landTestTitle:   { en: 'Trusted by building managers across Dhaka', bn: 'ঢাকার বাড়িওয়ালারা ভরসা করেন' },
  landTest1Role:   { en: 'Building Manager', bn: 'ভবন ম্যানেজার' },
  landTest1Loc:    { en: 'Bashundhara R/A, Dhaka', bn: 'বসুন্ধরা আ/এ, ঢাকা' },
  landTest1Quote:  { en: "Before Bari Shamlai, I tracked rent in a notebook and chased tenants on WhatsApp every month. Now receipts go out automatically. I don't even think about it anymore.", bn: 'বাড়ি সামলাই-এর আগে খাতায় ভাড়া লিখতাম, WhatsApp-এ ভাড়াটেদের পিছনে ঘুরতাম। এখন রসিদ আপনাআপনি চলে যায়। আর মাথা ঘামাতে হয় না।' },
  landTest2Role:   { en: 'Property Owner', bn: 'বাড়ির মালিক' },
  landTest2Loc:    { en: 'Uttara, Dhaka', bn: 'উত্তরা, ঢাকা' },
  landTest2Quote:  { en: "I used to rely on a caretaker to collect rent and give me a summary — which was never accurate. Now I see exactly who's paid from my phone, wherever I am.", bn: 'আগে কেয়ারটেকারের হিসাবে ভরসা করতাম — যা কোনোদিনই ঠিক থাকত না। এখন ফোন থেকেই দেখি কে দিয়েছেন।' },
  landTest3Role:   { en: 'Tenant', bn: 'ভাড়াটে' },
  landTest3Loc:    { en: 'Gulshan-2, Dhaka', bn: 'গুলশান-২, ঢাকা' },
  landTest3Quote:  { en: "I used to argue with my building manager about whether I'd paid the service charge. Now I just show my Bari Shamlai receipt. No more disputes. Ever.", bn: 'সার্ভিস চার্জ দিয়েছি কি না তা নিয়ে ঝগড়া হতো। এখন রসিদ দেখিয়ে দিই। আর কথা নেই।' },

  // ── Landing — FAQ ────────────────────────────────────────────────
  landFaqHeader: { en: 'FAQ', bn: 'প্রশ্নোত্তর' },
  landFaqTitle:  { en: 'Common questions', bn: 'সচরাচর জিজ্ঞাসা' },
  landFaq1Q:     { en: 'What happens when I exceed 5 units on the free plan?', bn: 'ফ্রি প্ল্যানে ৫টির বেশি ফ্ল্যাট হলে কী হবে?' },
  landFaq1A:     { en: "You'll see a clear message when you reach the 5-unit limit. To add more units, your account manager will upgrade your building to a paid plan based on your unit count.", bn: '৫টি ফ্ল্যাটের সীমা পূর্ণ হলে একটি বার্তা দেখাবে। আরো ফ্ল্যাট যোগ করতে আমাদের সাথে যোগাযোগ করুন — আমরা আপনার ভবনকে সঠিক প্ল্যানে নিয়ে যাব।' },
  landFaq2Q:     { en: 'How does billing and rent collection work?', bn: 'বিল ও ভাড়া সংগ্রহ কীভাবে কাজ করে?' },
  landFaq2A:     { en: "Set the monthly rent and charges per unit. Bari Shamlai generates bills automatically each month. When a tenant pays, mark it as paid — they'll receive a digital receipt instantly.", bn: 'প্রতিটি ফ্ল্যাটের ভাড়া ও চার্জ ঠিক করুন। বাড়ি সামলাই প্রতি মাসে বিল তৈরি করে। পেমেন্ট হলে পেইড করুন — ভাড়াটে সাথে সাথে ডিজিটাল রসিদ পাবেন।' },
  landFaq3Q:     { en: 'Can tenants and owners see their own portal?', bn: 'ভাড়াটে ও মালিক কি নিজেদের পোর্টাল দেখতে পারবেন?' },
  landFaq3A:     { en: 'Yes. Every tenant and owner gets a separate login. They see only their unit — their bills, payment history, and receipts. Admins see everything.', bn: 'হ্যাঁ। প্রতিটি ভাড়াটে ও মালিক আলাদা লগইন পান। তারা শুধু নিজেদের ফ্ল্যাট দেখেন — বিল, পেমেন্টের ইতিহাস, রসিদ। অ্যাডমিন সব দেখেন।' },
  landFaq4Q:     { en: 'How is gas bill calculated?', bn: 'গ্যাস বিল কীভাবে হিসাব হয়?' },
  landFaq4A:     { en: 'You enter the meter reading for each unit. Bari Shamlai calculates consumption (current − previous reading) and splits the total gas cost proportionally across all units.', bn: 'প্রতিটি ফ্ল্যাটের মিটার রিডিং দিন। বাড়ি সামলাই ব্যবহার (বর্তমান − আগের রিডিং) হিসাব করে এবং মোট গ্যাস খরচ সমানুপাতে সব ফ্ল্যাটে ভাগ করে দেয়।' },
  landFaq5Q:     { en: 'Is my data secure?', bn: 'আমার ডেটা কি নিরাপদ?' },
  landFaq5A:     { en: 'All data is stored securely in a cloud database with daily backups. Your building data is completely isolated from other buildings on the platform.', bn: 'সব ডেটা প্রতিদিনের ব্যাকআপসহ ক্লাউডে নিরাপদে রাখা হয়। আপনার ভবনের তথ্য অন্য ভবন থেকে সম্পূর্ণ আলাদা।' },
  landFaq6Q:     { en: 'How do I upgrade from the free plan?', bn: 'ফ্রি প্ল্যান থেকে কীভাবে আপগ্রেড করব?' },
  landFaq6A:     { en: "Contact your Bari Shamlai account manager. They'll activate the right plan for your building based on your unit count. Usually done within 24 hours.", bn: 'আমাদের সাথে যোগাযোগ করুন। ফ্ল্যাটের সংখ্যা অনুযায়ী সঠিক প্ল্যান চালু করে দেব। সাধারণত ২৪ ঘণ্টার মধ্যে হয়।' },

  // ── Landing — CTA ────────────────────────────────────────────────
  landCtaHeader:   { en: 'GET STARTED TODAY', bn: 'আজই শুরু করুন' },
  landCtaTitle:    { en: 'Your building deserves\nbetter than a notebook.', bn: 'একটা খাতার চেয়ে ভালো কিছু\nআপনার বাড়ি পাওয়ার যোগ্য।' },
  landCtaSub:      { en: "Join 500+ building managers who've replaced chaos with clarity.\nFree to start. No credit card.", bn: '৫০০+ বাড়িওয়ালা এভাবেই এগিয়ে গেছেন।\nফ্রিতে শুরু। কার্ড লাগবে না।' },
  landCtaCreate:   { en: 'Create Free Account', bn: 'ফ্রি অ্যাকাউন্ট খুলুন' },
  landCtaExisting: { en: 'Sign in to existing account', bn: 'আগের অ্যাকাউন্টে লগইন করুন' },

  // ── Landing — Footer ─────────────────────────────────────────────
  landFooterDesc:  { en: "The smartest way to manage every flat, every floor, every month. Built for Bangladesh's apartment managers.", bn: 'প্রতিটি ফ্ল্যাট, প্রতিটি তলা, প্রতি মাস — সহজে। বাংলাদেশের বাড়িওয়ালাদের জন্য তৈরি।' },
  landFooterProduct: { en: 'Product', bn: 'পণ্য' },
  landFooterAccount: { en: 'Account', bn: 'অ্যাকাউন্ট' },
  landFooterLegal:   { en: 'Legal', bn: 'আইনি' },
  landFooterFeatures: { en: 'Features', bn: 'বৈশিষ্ট্য' },
  landFooterPricing:  { en: 'Pricing', bn: 'মূল্য' },
  landFooterHowItWorks: { en: 'How It Works', bn: 'কীভাবে কাজ করে' },
  landFooterFAQ:     { en: 'FAQ', bn: 'প্রশ্নোত্তর' },
  landFooterSignUp:  { en: 'Sign Up', bn: 'নিবন্ধন করুন' },
  landFooterSignIn:  { en: 'Sign In', bn: 'লগইন করুন' },
  landFooterReset:   { en: 'Reset Password', bn: 'পাসওয়ার্ড রিসেট' },
  landFooterPrivacy: { en: 'Privacy Policy', bn: 'গোপনীয়তা নীতি' },
  landFooterTerms:   { en: 'Terms of Service', bn: 'সেবার শর্তাবলী' },
  landFooterCookies: { en: 'Cookie Policy', bn: 'কুকি নীতি' },
  landFooterCopyright: { en: '© {year} Bari Shamlai. All rights reserved.', bn: '© {year} বাড়ি সামলাই। সর্বস্বত্ব সংরক্ষিত।' },
  landFooterMade:    { en: "Made with ❤️ for Bangladesh's apartment managers", bn: 'বাংলাদেশের বাড়িওয়ালাদের জন্য ❤️ দিয়ে তৈরি' },
} as const

export type TranslationKey = keyof typeof translations

export function translate(key: TranslationKey, lang: Lang): string {
  const entry = translations[key] as Record<Lang, string>
  return entry[lang] ?? entry['en'] ?? key
}

/** Translate a month number (1-12) */
export function translateMonth(m: number, lang: Lang): string {
  const k = `month${m}` as TranslationKey
  return translate(k, lang)
}

/** Translate a bill type string */
export function translateBillType(type: string, lang: Lang): string {
  const map: Record<string, TranslationKey> = {
    RENT: 'billRent', SERVICE_CHARGE: 'billSC', GAS: 'billGas', OTHER: 'billOther',
  }
  const k = map[type]
  return k ? translate(k, lang) : type
}

/** Translate a bill status string */
export function translateStatus(status: string, lang: Lang): string {
  const map: Record<string, TranslationKey> = {
    PAID: 'statusPaid', PENDING: 'statusPending', OVERDUE: 'statusOverdue',
  }
  const k = map[status]
  return k ? translate(k, lang) : status
}
