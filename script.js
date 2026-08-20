// ==========================================
// 1. المتطلبات والعناصر الأساسية للسلة والشات بوت
// ==========================================
const cartIcon = document.querySelector('.cart-icon');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutForm = document.getElementById('checkoutForm');
const cartItemsContainer = document.querySelector('.cart-items-container');
const totalPriceEl = document.querySelector('.total-price');
const checkoutFormElement = document.getElementById('checkoutForm');

// مصفوفة لتخزين الوجبات المضافة للسلة
let cart = [];

// قائمة بأسماء العملاء الذين قاموا بعمل طلبات (متصلة بالشات بوت لتتبع الأوردر)
let activeOrders = ['أحمد محمد', 'محمد علي', 'محمود حسن', 'سارة خالد'];

// ==========================================
// 2. تفعيل السلة وإتمام الطلب
// ==========================================
cartIcon.addEventListener('click', (e) => {
  e.preventDefault();
  cartModal.style.display = 'flex';
});

closeCart.addEventListener('click', () => {
  cartModal.style.display = 'none';
  checkoutForm.style.display = 'none';
  cartItemsContainer.style.display = 'block';
  checkoutBtn.style.display = 'block';
});

checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('عذراً، السلة فارغة! يرجى إضافة وجبات أولاً قبل إتمام الطلب.');
    return;
  }

  cartItemsContainer.style.display = 'none';
  checkoutForm.style.display = 'flex';
  checkoutBtn.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === cartModal) {
    cartModal.style.display = 'none';
    checkoutForm.style.display = 'none';
    cartItemsContainer.style.display = 'block';
    checkoutBtn.style.display = 'block';
  }
});

// دالة تحديث واجهة السلة
function updateCartUI() {
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart-msg">السلة فارغة حالياً</p>';
    totalPriceEl.innerText = '0 ج.م';
    return;
  }

  cartItemsContainer.innerHTML = '';
  let total = 0;

  cart.forEach((item) => {
    total += item.price;
    const itemRow = document.createElement('div');
    itemRow.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 8px; align-items: center; color: #fff;';
    itemRow.innerHTML = `
      <span>${item.name}</span>
      <span>${item.price} ج.م</span>
    `;
    cartItemsContainer.appendChild(itemRow);
  });

  totalPriceEl.innerText = total + ' ج.م';
}

// ==========================================
// 3. تفعيل أزرار "أضف للسلة" (للمنيو والعروض معاً)
// ==========================================
const addToCartButtons = document.querySelectorAll('.add-to-cart');

addToCartButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    
    const card = button.closest('.menu-card') || button.closest('.offer-card') || button.parentElement;
    
    const nameEl = card.querySelector('h3') || card.querySelector('h4') || card.querySelector('.title');
    const priceEl = card.querySelector('.price');

    if (!nameEl || !priceEl) {
      alert('عذراً، حدث خطأ أثناء قراءة بيانات المنتج.');
      return;
    }

    const itemName = nameEl.innerText;
    const itemPriceText = priceEl.innerText;
    const itemPrice = parseInt(itemPriceText.replace(/[^\d]/g, ''));

    cart.push({ name: itemName, price: itemPrice });
    updateCartUI();

    alert('تم إضافة الوجبة/العرض إلى السلة بنجاح! 🍔');
  });
});

// ==========================================
// 4. معالجة نموذج تأكيد الطلب وإرساله للكاشير
// ==========================================
checkoutFormElement.addEventListener('submit', (e) => {
  e.preventDefault();

  const nameInput = checkoutFormElement.querySelector('input[type="text"]').value.trim();
  const phoneInput = checkoutFormElement.querySelector('input[type="tel"]').value.trim();
  const addressInput = checkoutFormElement.querySelector('textarea').value.trim();

  if (!nameInput || !phoneInput || !addressInput) {
    alert('من فضلك املأ جميع الحقول المطلوبة!');
    return;
  }

  // تجميع اسم وجبات السلة في نص واحد
  let orderItemsSummary = cart.map(item => `${item.name} (${item.price} ج.م)`).join(' - ');
  
  // حساب إجمالي السعر
  let totalAmount = cart.reduce((sum, item) => sum + item.price, 0) + ' ج.م';

  // تجهيز كائن الأوردر الجديد لإرساله للكاشير
  const newOrder = {
    id: Math.floor(100 + Math.random() * 900), // رقم أوردر عشوائي
    name: nameInput,
    phone: phoneInput,
    address: addressInput,
    total: totalAmount,
    items: orderItemsSummary
  };

  // حفظ الأوردر في الـ LocalStorage عشان صفحة cashier.html تقرأه
  let existingOrders = JSON.parse(localStorage.getItem('restaurantOrders')) || [];
  existingOrders.push(newOrder);
  localStorage.setItem('restaurantOrders', JSON.stringify(existingOrders));

  if (!activeOrders.includes(nameInput)) {
    activeOrders.push(nameInput);
  }

  alert(`🎉 مبروك يا ${nameInput}! تم إرسال أوردرك للمطعم بنجاح وسيقوم الكاشير بمراجعته.`);

  // إعادة تعيين السلة واجهة المستخدم وإغلاق المودال
  cart = [];
  updateCartUI();

  cartModal.style.display = 'none';
  checkoutFormElement.style.display = 'none';
  cartItemsContainer.style.display = 'block';
  checkoutBtn.style.display = 'block';
  checkoutFormElement.reset();
});

// ==========================================
// 5. نظام الشات بوت الذكي وتتبع الأوردرات (المحدث نهائياً)
// ==========================================
const chatbotToggler = document.getElementById('chatbotToggler');
const chatbotWindow = document.getElementById('chatbotWindow');
const closeChatbot = document.getElementById('closeChatbot');
const chatbotBody = document.getElementById('chatbotBody');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

chatbotToggler.addEventListener('click', () => {
  chatbotWindow.style.display = chatbotWindow.style.display === 'flex' ? 'none' : 'flex';
});

closeChatbot.addEventListener('click', () => {
  chatbotWindow.style.display = 'none';
});

sendBtn.addEventListener('click', handleUserMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleUserMessage();
});

function handleUserMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage(text, 'user-message');
  userInput.value = '';

  setTimeout(() => {
    const botReply = getBotResponse(text);
    appendMessage(botReply, 'bot-message');
  }, 500);
}

function appendMessage(text, className) {
  const msgDiv = document.createElement('div');
  msgDiv.className = className;
  msgDiv.innerHTML = text;
  chatbotBody.appendChild(msgDiv);
  chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

function getBotResponse(input) {
  let lowerInput = input.toLowerCase();

  // التحقق من وجود اسم عميل نشط في النص المدخل
  let foundOrder = activeOrders.find(name => lowerInput.includes(name.toLowerCase()));

  // 1. لو العميل سأل عن الدليفري وذكر اسمه في نفس الجملة
  if ((lowerInput.includes('اتسلم') || lowerInput.includes('دليفري') || lowerInput.includes('طلبي') || lowerInput.includes('اوردر') || lowerInput.includes('أوردر')) && foundOrder) {
    return `✅ أهلاً يا ${foundOrder}! أوردرك **اتسلم بالفعل لمندوب التوصيل (الدليفري)** وهو في طريقه إليك الآن 🛵💨.`;
  }

  // 2. لو سأل عن حالة الأوردر أو الدليفري بشكل عام من غير ما يكتب اسمه
  if (
    lowerInput.includes('حالة الاوردر') || 
    lowerInput.includes('طلبي فين') || 
    lowerInput.includes('الدليفري') || 
    lowerInput.includes('اتسلم') || 
    lowerInput.includes('وصل فين') || 
    lowerInput.includes('اوردر') || 
    lowerInput.includes('أوردر') ||
    lowerInput.includes('طلب') ||
    lowerInput.includes('تسلم')
  ) {
    return '🤖 أهلاً بك! لمعرفة هل أوردرك اتسلم للدليفري ولا لسه، من فضلك اكتب **اسمك** الذي قمت بالطلب به (مثلاً: أحمد محمد).';
  }

  // 3. لو كتب اسمه لوحده (بعد طلب البوت)
  if (foundOrder) {
    return `✅ أهلاً يا ${foundOrder}! أوردرك **اتسلم لمندوب التوصيل (الدليفري)** وخرج من المطعم في طريقه إليك 🛵✨.`;
  } 

  // 4. التحقق إذا كتب المستخدم اسماً غير موجود في النظام
  const questionKeywords = ['إيه', 'ازيك', 'مرحبا', 'أحسن', 'افضل', 'حار', 'سبايسي', 'أرخص', 'توصيل', 'أطفال', 'المنيو', 'موقعنا', 'مواعيد', 'عروض', 'كم', 'فين', 'هل', 'ازاى', 'السلام'];
  let isAQuestion = questionKeywords.some(word => lowerInput.includes(word));

  if (!isAQuestion && input.trim().length > 2) {
    return `❌ عذراً يا "${input}"، مفيش أوردر بالاسم ده في النظام لدينا! تأكد من كتابة الاسم الصحيح الذي قمت بالطلب به، أو اطلب أوردر جديد من السلة 🛒.`;
  }

  // 5. الأسئلة الشائعة
  if (lowerInput.includes('أحسن وجبة') || lowerInput.includes('افضل وجبة') || lowerInput.includes('أفضل أكل')) {
    return '🍔 أحسن وأشهر وجبة عندنا هي "بيج بونز برجر" و"ماشروم سويس برجر"، أنصحك تجربهم!';
  } 
  else if (lowerInput.includes('حار') || lowerInput.includes('سبايسي') || lowerInput.includes('شطة')) {
    return '🌶️ نعم! عندنا "فلاينج سبايسي تشيكن" مغطى بصوص البافلو الحار والجلابينو.';
  } 
  else if (lowerInput.includes('أرخص') || lowerInput.includes('أقل سعر')) {
    return '🍟 أرخص حاجة عندنا هي المشروبات الغازية بـ 25 ج.م، وحلقات البصل بـ 40 ج.م.';
  } 
  else if (lowerInput.includes('توصيل') || lowerInput.includes('ديليفري')) {
    return '🛵 أيوة طبعا عندنا خدمة توصيل لكل المناطق! تقدر تطلب أوردرك وتحدده من السلة فوق.';
  } 
  else if (lowerInput.includes('أطفال') || lowerInput.includes('اطفال')) {
    return '👶 أيوة، موفرين "وجبة الأطفال" بـ 75 ج.م فقط!';
  }
  else if (lowerInput.includes('المنيو') || lowerInput.includes('قائمة')) {
    return '📜 تقدر تشوف كل وجباتنا وعروضنا مباشرة في قسم "قائمتنا المميزة" فوق!';
  }
  else if (lowerInput.includes('موقعنا') || lowerInput.includes('العنوان') || lowerInput.includes('فين')) {
    return '📍 إحنا موجودين في: شارع الرئيسي، بالقرب من ميدان الشهداء.';
  }
  else if (lowerInput.includes('مواعيد') || lowerInput.includes('فتح')) {
    return '🕒 مواعيد العمل: يومياً من الساعة 12 ظهراً حتى 3 صباحاً.';
  }
  else if (lowerInput.includes('عروض') || lowerInput.includes('خصم')) {
    return '🎉 عندنا عروض جامدة زي "عرض العيلة" و"عرض الدبل"، تقدر تشوفهم فوق!';
  }
  else {
    return '🤖 أهلاً بك! أنا أقدر أساعدك في معرفة المنيو، الأسعار، العروض، أو تتبع حالة أوردرك بكتابة اسمك!';
  }
}
// ==========================================
// نظام تسجيل الدخول الإجباري عند فتح الموقع
// ==========================================
const authModal = document.getElementById('authModal');
const toLoginTab = document.getElementById('toLoginTab');
const toRegisterTab = document.getElementById('toRegisterTab');
const manualLoginForm = document.getElementById('manualLoginForm');
const manualRegisterForm = document.getElementById('manualRegisterForm');
const authMainView = document.getElementById('authMainView');
const otpVerificationView = document.getElementById('otpVerificationView');
const userPhoneNumberDisplay = document.getElementById('userPhoneNumberDisplay');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
const otpCodeInput = document.getElementById('otpCodeInput');

// التأكد من ظهور النافذة إجبارياً فور فتح الصفحة
window.addEventListener('DOMContentLoaded', () => {
  if (authModal) {
    authModal.style.display = 'flex';
  }
});

// التبديل بين التبويبات (تسجيل دخول / إنشاء حساب)
toLoginTab.addEventListener('click', () => {
  toLoginTab.classList.add('active');
  toRegisterTab.classList.remove('active');
  manualLoginForm.style.display = 'flex';
  manualRegisterForm.style.display = 'none';
});

toRegisterTab.addEventListener('click', () => {
  toRegisterTab.classList.add('active');
  toLoginTab.classList.remove('active');
  manualRegisterForm.style.display = 'flex';
  manualLoginForm.style.display = 'none';
});

// تسجيل الدخول اليدوي (يخفي النافذة ويدخله السيستم)
manualLoginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('✨ تم تسجيل الدخول بنجاح! أهلاً بك في مطعم BUNZO.');
  authModal.style.display = 'none'; // إخفاء نافذة الدخول والسماح بتصفح الموقع
});

// تسجيل الدخول بجوجل
document.getElementById('googleLoginBtn').addEventListener('click', () => {
  alert('🌐 جارٍ المصادقة مع Google... أهلاً بك!');
  authModal.style.display = 'none';
});

// تسجيل الدخول فيسبوك
document.getElementById('fbLoginBtn').addEventListener('click', () => {
  alert('🌐 جارٍ المصادقة مع Facebook... أهلاً بك!');
  authModal.style.display = 'none';
});

let temporaryPhone = '';

// إنشاء حساب جديد وإرسال كود الواتساب/SMS
manualRegisterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const phoneInputVal = manualRegisterForm.querySelector('input[type="tel"]').value.trim();
  const nameInputVal = manualRegisterForm.querySelector('input[type="text"]').value.trim();

  if (!phoneInputVal) {
    alert('من فضلك أدخل رقم الهاتف بشكل صحيح.');
    return;
  }

  temporaryPhone = phoneInputVal;
  userPhoneNumberDisplay.innerText = temporaryPhone;

  authMainView.style.display = 'none';
  otpVerificationView.style.display = 'block';

  alert(`💬 [رسالة واتساب / SMS تلقائية]: أهلاً ${nameInputVal}، كود التحقق لحسابك في BUNZO هو: 1234`);
});

// تأكيد كود الواتساب والدخول الفوري للسيستم
verifyOtpBtn.addEventListener('click', () => {
  const enteredOtp = otpCodeInput.value.trim();

  if (enteredOtp === '1234') {
    alert('🎉 تم تفعيل الحساب وتسجيل الدخول بنجاح عبر الواتساب!');
    authModal.style.display = 'none'; // فتح الموقع للعميل
    
    // إعادة تعيين النوافذ لو احتجناها لاحقاً
    authMainView.style.display = 'block';
    otpVerificationView.style.display = 'none';
    manualRegisterForm.reset();
    otpCodeInput.value = '';
  } else {
    alert('❌ كود التحقق غير صحيح! الكود التجريبي هو 1234');
  }
});
// متغير لتخزين كود التحقق العشوائي
let currentGeneratedOtp = '';

// إنشاء حساب جديد وتوليد كود عشوائي وإرساله عبر الواتساب / SMS
manualRegisterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nameInputVal = manualRegisterForm.querySelector('input[type="text"]').value.trim();
  const phoneInputVal = manualRegisterForm.querySelector('input[type="tel"]').value.trim();

  if (!phoneInputVal) {
    alert('من فضلك أدخل رقم الهاتف بشكل صحيح.');
    return;
  }

  temporaryPhone = phoneInputVal;
  userPhoneNumberDisplay.innerText = temporaryPhone;

  // توليد كود عشوائي مكون من 4 أرقام (مثلاً: 4892، 7130، إلخ)
  currentGeneratedOtp = Math.floor(1000 + Math.random() * 9000).toString();

  // الانتقال لخطوة إدخال كود التحقق
  authMainView.style.display = 'none';
  otpVerificationView.style.display = 'block';

  // محاكاة إرسال رسالة واتساب حقيقية مع زر لفتح الواتساب الفعلي لو حابب
  const whatsappMessage = encodeURIComponent(`مرحباً ${nameInputVal}، كود التحقق الخاص بك في مطعم BUNZO هو: *${currentGeneratedOtp}*`);
  
  // عرض تنبيه بالرسالة وفي نفس الوقت فتح محاكاة وصول رسالة الواتساب
  console.log("Generated OTP:", currentGeneratedOtp); // للتتبع السريع لو احتجته
  
  alert(`📲 تم إرسال رسالة واتساب / SMS تلقائية إلى الرقم (${phoneInputVal})\n\n[معاينة الرسالة]: كود التحقق الخاص بك في BUNZO هو: ${currentGeneratedOtp}`);
  
  // (اختياري) لو رقم الهاتف حقيقي وحابب تبعت له رسالة واتساب حقيقية مباشرة من المتصفح:
  // window.open(`https://wa.me/${phoneInputVal}?text=${whatsappMessage}`, '_blank');
});

// تأكيد كود الـ OTP العشوائي والدخول للسيستم
verifyOtpBtn.addEventListener('click', () => {
  const enteredOtp = otpCodeInput.value.trim();

  if (enteredOtp === currentGeneratedOtp && enteredOtp !== '') {
    alert('🎉 تم تفعيل رقم الهاتف والحساب بنجاح عبر رسالة الواتساب!');
    authModal.style.display = 'none'; // فتح الموقع للعميل
    
    // إعادة تعيين الشاشات
    authMainView.style.display = 'block';
    otpVerificationView.style.display = 'none';
    manualRegisterForm.reset();
    otpCodeInput.value = '';
  } else {
    alert('❌ كود التحقق غير صحيح! يرجى التأكد من الكود الذي تم إرساله في رسالة الواتساب.');
  }
});
// افتراض إننا عرفنا نوع المستخدم اللي داخل السيستم (مثلاً مخزن في الـ localStorage)
const userRole = localStorage.getItem('userRole') || 'admin'; // ممكن تكون 'staff' أو 'admin'

if (userRole === 'staff') {
  // لو موظف عادي، هنخفي نموذج إضافة أكلات ونعطل أزرار الحذف
  document.querySelector('.add-form').style.display = 'none';
  
  // إخفاء أعمدة الحذف من الجدول
  const deleteButtons = document.querySelectorAll('.del-btn');
  deleteButtons.forEach(btn => btn.style.display = 'none');
  
  // تغيير العنوان ليوضح إنه دخل بصلاحيات محدودة
  document.querySelector('.header h1').innerText = 'لوحة متابعة الطلبات (صلاحيات موظف)';
}
// ==========================================
// عرض الأوردرات المسندة للدليفري من الـ LocalStorage
// ==========================================
function loadDeliveryOrders() {
  const container = document.getElementById('deliveryContainer'); // اتأكد إن ده الـ ID بتاع المكان اللي بتعرض فيه الأوردرات في صفحة الدليفري
  
  if (!container) return; // لو مش موجود في الصفحة الحالية، اتخطى الكود عشان ميعملش أخطاء

  let deliveryList = JSON.parse(localStorage.getItem('deliveryQueue')) || [];

  container.innerHTML = '';

  if (deliveryList.length === 0) {
    container.innerHTML = `<p style="color: #9ca3af; text-align:center; padding: 20px;">لا توجد طلبات توصيل مسندة إليك حالياً.</p>`;
    return;
  }

  deliveryList.forEach((order, index) => {
    container.innerHTML += `
      <div class="order-card" style="background: #111827; padding: 20px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #1f2937; color: #fff;">
        <p style="color: #10b981; font-weight: bold;">رقم الأوردر: #${order.id} (مسند إلى: ${order.driver})</p>
        <p><strong>العميل:</strong> ${order.name} - ${order.phone}</p>
        <p><strong>العنوان:</strong> ${order.address}</p>
        <p><strong>الطلبات:</strong> ${order.items}</p>
        <p style="color: #f97316; margin-top: 5px;"><strong>الإجمالي:</strong> ${order.total}</p>
        <button onclick="completeOrder(${index})" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-top: 10px; font-weight: bold;">تم التوصيل ✓</button>
      </div>
    `;
  });
}

function completeOrder(index) {
  let deliveryList = JSON.parse(localStorage.getItem('deliveryQueue')) || [];
  deliveryList.splice(index, 1);
  localStorage.setItem('deliveryQueue', JSON.stringify(deliveryList));
  loadDeliveryOrders();
  alert('تم تسليم الأوردر بنجاح وإزالته من القائمة!');
}

// تشغيل الدالة أول ما الصفحة تفتح
window.addEventListener('DOMContentLoaded', loadDeliveryOrders);