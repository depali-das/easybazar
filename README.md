# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Smart Search ব্যবহার

Storefront-এর header search-এ বাংলা বা ইংরেজিতে product, category, description, কিংবা পরিচিত বিকল্প নাম লিখুন। টাইপের সঙ্গে catalog result filter হবে; dropdown থেকে suggestion নির্বাচন করলে product details খুলবে, আর cart icon দিয়ে সরাসরি cart-এ যোগ করা যাবে। Arrow keys, Enter এবং Escape দিয়ে dropdown চালানো যায়।

সাম্প্রতিক search সর্বোচ্চ ১০টি হিসেবে `easybazar_search_history`-এ থাকে। Trending keyword `easybazar_trending_searches`-এ রাখা হয়। Dropdown-এ **Clear** দিয়ে recent history মুছুন। বাংলা/ইংরেজি keyword mapping এবং fuzzy matching `src/utils/smartSearch.js`-এ আছে; নতুন product-এর জন্য optional `searchKeywords` array-ও সমর্থিত।

Catalog-এর filter থেকে category, minimum/maximum price, price order, popularity (saved orders অনুযায়ী), recently added, discounted product এবং available product বেছে নিন। কোনো match না থাকলে clear-filter action দেখায়। এটি সম্পূর্ণ browser-side search; কোনো API বা backend ব্যবহার করে না।

Product details page-এ star rating ও লিখিত review দেখা যায়। Signed-in demo customer প্রতি product-এ একটি review দিতে পারেন; review browser-এর `easybazar-product-reviews` LocalStorage key-এ থাকে এবং production verification নয়।

পরীক্ষার জন্য `npm run dev` চালিয়ে `alu`, `আলু`, `pot`, `dudh`, `পেঁয়াজ`, অথবা `potatoo` লিখুন। Suggestion নির্বাচন, Add to Cart, history clear এবং category/price/product filter-ও পরীক্ষা করুন।

## Customer Support ও Contact (ডেমো)

- `/contact`-এ EasyBazar-এর official phone, email, WhatsApp, service area, support time, support form এবং FAQ দেখুন। Google Maps দেখানো হয় না, কারণ কোনো verified business location দেওয়া নেই।
- `/support`-এ support request দিন; Order History-র **Need Help?** button order ID ও `Order Problem` category-সহ form-টি prefill করে।
- `/support/tickets`-এ signed-in demo customer-এর সঙ্গে যুক্ত request, ticket ID, status ও details দেখা যায়। Data `easybazar_support_requests` LocalStorage key-এ থাকে।
- Admin-এর `/admin/support` page-এ browser-এর ticket দেখা ও status পরিবর্তন করা যায়।
- Phone, email ও WhatsApp link যথাক্রমে device-এর call app, email app এবং WhatsApp chat খোলে। Support form/ticket management frontend-only: staff notification, real server, secure account verification বা remote ticket status management নেই।
- Floating WhatsApp and support buttons storefront, order history, checkout and support pages-এ পাওয়া যায়। Order History-র WhatsApp action message-এ Order ID যোগ করে।
- Delivery fee ৳60; ৳500 বা বেশি product subtotal-এ delivery free। এটি cart, checkout, order history এবং tracking-এ প্রয়োগ হয়। Coupon discount free-delivery threshold-এ গণনা হয় না।

Contact number, email, hours এবং delivery threshold `src/config/contact.js` থেকে নেওয়া হয়। LocalStorage clear করলে demo support ticket মুছে যাবে।

## Smart Notifications (ডেমো)

- Storefront header-এর bell থেকে সাম্প্রতিক notification খুলুন; `/notifications`-এ All, Unread, Orders, Offers ও General filter, read/delete/clear actions এবং notification preferences আছে।
- Order create ও Admin Dashboard থেকে status বদলালে order/delivery category চালু থাকলে notification তৈরি হয়। Order-status event-এর dedupe key থাকায় একই order ও status-এর duplicate event পুনরায় তৈরি হয় না।
- Free-delivery notice ও সক্রিয় catalog coupon-এর notification বিদ্যমান policy/offer data থেকে তৈরি হয়; Admin-এর `/admin/notifications` থেকে existing coupon announce/edit/delete অথবা general announcement যোগ করা যায়। এগুলো শুধু একই browser-এর notification list-এ যোগ হয়।
- Notification, category preferences ও browser-notification setting LocalStorage-এর `easybazar_notifications`, `easybazar_notification_preferences`, `easybazar_notification_settings` keys-এ থাকে। Notification list সর্বোচ্চ 100টি রাখে।
- Browser alert opt-in করতে `/notifications`-এর settings-এ **Enable Browser Notifications** চাপুন। Permission click-এর পরে চাওয়া হয়; HTTPS বা localhost-এ browser support সাপেক্ষে কাজ করে। In-app notification browser permission ছাড়াই কাজ করে। Website বন্ধ থাকলে push পৌঁছানোর নিশ্চয়তা নেই; প্রকৃত push delivery-র জন্য server প্রয়োজন।
- সব notification এবং admin controls frontend demo। Shared account identity, অন্য device-এ পাঠানো, backend, service worker push বা real-time server delivery নেই।

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Delivery availability demo

Rajshahi is the only selectable district. Any non-empty area entered within
Rajshahi can pass the frontend demo check; `RAJSHAHI_DELIVERY_LOCATIONS` in
`src/data/deliveryAreas.js` provides suggestions, not a complete authoritative
locality registry. Other districts are unavailable.

The selected district and location are saved in this browser through
`src/context/DeliveryContext.jsx`. This is not a GPS, address verification, or
real-time coverage lookup; use a backend/locality dataset before production.

## অর্ডার ট্র্যাকিং ব্যবহার (ডেমো)

1. `npm install` দিয়ে dependency ইনস্টল করুন এবং `npm run dev` চালু করুন।
2. কনফিগার করা ডেলিভারি এলাকায় একটি পণ্য কার্টে যোগ করে Checkout থেকে অর্ডার দিন।
3. Order Confirmation-এর **Track Order** বাটন চাপুন, অথবা `/track-order` খুলে Order ID ও checkout-এ দেওয়া ফোন নম্বর লিখুন।
4. অর্ডারের অবস্থা দেখতে `/orders` খুলুন। Demo Admin-এর জন্য `/admin-orders` খুলে status পরিবর্তন করুন; পরিবর্তন customer tracking timeline-এ দেখা যাবে।
5. কোন status-গুলো admin-এ নির্বাচনযোগ্য তা `src/utils/orderTracking.js`-এর `ORDER_STATUSES` তালিকা নিয়ন্ত্রণ করে।

অর্ডার ও status history একই ব্রাউজারের LocalStorage-এ থাকে। Demo Admin পেজে production authentication নেই; এখানে কোনো GPS বা স্বয়ংক্রিয় rider update নেই।

## Admin Dashboard ব্যবহার (ফ্রন্টএন্ড ডেমো)

1. `npm install` এবং `npm run dev` চালু করে `/admin` খুলুন। Demo login: `admin@easybazar.demo` / `easybazar-demo`। Dashboard-এ দেখানো অর্ডার, বিক্রি ও customer সংখ্যা এই browser-এর সংরক্ষিত ডেমো ডেটা থেকে আসে; কোনো ব্যবসায়িক পরিসংখ্যান বানিয়ে দেখানো হয় না।
2. বাম পাশের মেনু থেকে Dashboard, Products, Categories, Orders, Customers, Inventory, Offers & Coupons, Notifications, Support Tickets, Delivery Areas অথবা Settings খুলুন। ছোট পর্দায় উপরের menu button দিয়ে sidebar খুলুন।
3. Products থেকে পণ্য যোগ, সম্পাদনা বা মুছুন। নতুন পণ্যের নাম, category, price ও stock দিন। পণ্যের পরিবর্তন storefront ও cart-এ ব্যবহৃত হয়; শূন্য stock-এর পণ্য কেনার জন্য যোগ করা যায় না।
4. Categories-এ category যোগ/সম্পাদনা করুন। কোনো পণ্যে ব্যবহৃত category মুছতে হলে আগে সেই পণ্য অন্য category-তে সরান।
5. Orders-এ Order ID দিয়ে খুঁজুন এবং status পরিবর্তন করুন। পরিবর্তন tracking page ও order history-তে দেখা যাবে। শুধু যোগ্য অর্ডার cancel করা যায়।
6. Customers-এর তথ্য checkout-এ সংরক্ষিত অর্ডার থেকে একত্রিত হয়; ফোন নম্বর আংশিক গোপন করে দেখানো হয়। Inventory-তে stock quantity ঠিক করুন, Offers & Coupons-এ demo coupon পরিচালনা করুন, Support Tickets-এ local ticket status আপডেট করুন, এবং Delivery Areas-এ Rajshahi area suggestion যোগ বা সরান.
7. Settings-এ storefront-এর নাম, logo, যোগাযোগের তথ্য ও ঠিকানা পরিবর্তন করুন। Delivery fee ৳60; ৳500+ product subtotal-এ free delivery। Payment option Cash on Delivery, bKash ও Nagad-ই থাকে।
8. সব dashboard ডেটা এই browser-এর LocalStorage-এ থাকে। Browser data মুছে ফেললে demo changes-ও মুছে যাবে।

এটি portfolio/demo dashboard মাত্র; demo login client-side এবং production security নয়। Admin page-এ থাকা product/order/support data-ও browser-এ বদলানো যায়। ব্যক্তিগত বা production customer data ব্যবহার করবেন না। Settings-এর logo/image browser storage-এ রাখার জন্য 512 KB-এর কম হতে হবে।

Customer `/account` dashboard-এ signed-in demo customer's profile, নিজের orders, saved addresses, wishlist, notification, coupon wallet ও support shortcut দেখা যায়। Demo authentication browser-only; এটি secure multi-user account ব্যবস্থা নয়।

## Coupon ও promo code ব্যবহার (ডেমো)

1. `/offers`-এ সক্রিয় demo coupon ও minimum order দেখে **Copy Code** চাপুন। প্রাথমিক demo code: `WELCOME10` (10%, ৳300 minimum), `SAVE50` (৳50, ৳500 minimum), `GROCERY15` (15%, ৳700 minimum), `FRESH100` (৳100, ৳1000 minimum), এবং `EASY20` (20%, ৳1200 minimum)।
2. Storefront-এর Cart খুলে বা `/checkout`-এ **Have a Coupon Code?** অংশে code লিখে **Apply Coupon** চাপুন। সফল code Cart ও Checkout-এ সংরক্ষিত থাকবে; refresh-এর পরও থাকবে। Remove করলে discount সরে যাবে।
3. Coupon-এর শর্ত পূরণ না হলে error দেখাবে। পণ্যের quantity/category বদলে eligibility না থাকলে coupon discount 0 হবে। এক customer-এ একবার ব্যবহারের coupon checkout-এ দেওয়া phone দিয়ে যাচাই হয়।
4. Admin-এর `/admin/offers` থেকে percentage বা fixed discount, minimum order, maximum discount, usage limit, date, category/product eligibility ও single-use নির্বাচন করুন। Coupon status/usage count সেখানেই পরিচালনা করা যায়।
5. `/offers` শুধু সক্রিয় ও তারিখের মধ্যে থাকা coupon দেখায়। Demo offer-গুলো coupon state প্রথমবার initialize হলে seed হয়; পরে সব coupon মুছে দিলেও পুনরায় seed হবে না।

Coupon discount শুধু eligible product subtotal-এ প্রযোজ্য। ৳500 product subtotal-এ delivery fee মওকুফ হয়; coupon discount free-delivery threshold-এ অন্তর্ভুক্ত হয় না। Coupon, redemption count ও order data frontend LocalStorage-এ থাকে—এটি demo, backend validation বা production security নয়।
# EasyBazar SEO ও Deployment নির্দেশিকা

## Local-এ যা প্রস্তুত

- React route অনুযায়ী title, description, robots, Open Graph, Twitter Card, canonical (শুধু আসল domain configure হলে) এবং JSON-LD তৈরি হয়।
- Public URL: Home, Shop, Products, Categories, category detail, Offers, About, Contact, FAQ ও product details। Cart, checkout, orders, account, support, tracking, notifications ও admin route-এ `noindex, nofollow` থাকে।
- Product structured data catalog-এর নাম, বর্ণনা, ছবি, দাম, BDT currency এবং জানা থাকলেই stock status নেয়। কোনো review বা rating বানানো হয়নি।
- Domain না থাকায় `public/sitemap.xml`-এ কোনো URL নেই। Localhost বা কল্পিত domain final sitemap-এ যোগ করা হয়নি।

## Deploy করার আগে

1. HTTPS-সহ আসল domain-এ site deploy করুন। `/products/1` ও `/category/vegetables`-এর মতো React URL সরাসরি খুললেও host যেন SPA-কে `index.html` দিয়ে serve করে।
2. `src/config/seo.js` খুলে `SEO_CONFIG.siteUrl`-এ আপনার আসল HTTPS origin লিখুন; path বা শেষের slash দেবেন না। উদাহরণের লেখা কপি করে domain হিসেবে ব্যবহার করবেন না।
3. এরপর চালান:

   ```sh
   npm run seo:sitemap
   npm run build
   npm run preview
   ```

   Sitemap generator public page, category এবং code-এ থাকা seed product-এর absolute URL `public/sitemap.xml`-এ লিখবে। Admin/localStorage-এ যোগ করা পণ্য static sitemap-এ আসে না; সেগুলোর জন্য publishable product database থেকে sitemap generate করার ব্যবস্থা লাগবে। Product catalog বা domain বদলালে আবার চালিয়ে generated file deploy করুন।
4. `public/robots.txt`-এর নির্দেশনামূলক comment-টি আসল domain-সহ `Sitemap: https://আপনার-আসল-domain/sitemap.xml` directive দিয়ে বদলান। Domain না পাওয়া পর্যন্ত sitemap URL যোগ করবেন না।
5. Direct URL, canonical, OG/Twitter preview, product price/stock এবং HTTPS certificate পরীক্ষা করুন। `/sitemap.xml`, `/robots.txt` ও image যেন static file হিসেবে পাওয়া যায়।

## Google Search Console: ধাপে ধাপে

1. [Google Search Console](https://search.google.com/search-console) খুলে Google account-এ sign in করুন।
2. **Add property** চাপুন। পুরো domain যাচাই করতে **Domain** বেছে DNS verification করুন; নির্দিষ্ট HTTPS URL যাচাই করতে **URL prefix** নিতে পারেন।
3. Search Console-এর দেওয়া TXT record আপনার domain-এর DNS provider-এ যোগ করুন। DNS update হতে সময় লাগতে পারে; এরপর **Verify** চাপুন।
4. Search Console-এর **Sitemaps** অংশে `sitemap.xml` লিখে submit করুন। Status-এ সফলভাবে পড়া হয়েছে কি না দেখুন।
5. **URL Inspection**-এ homepage, category এবং product URL দিয়ে পরীক্ষা করুন।
6. URL live এবং indexable হলে **Test Live URL**, এরপর **Request Indexing** চাপুন। Request দিলেই indexing নিশ্চিত হয় না; Google-এর crawl করতে সময় লাগতে পারে।
7. **Pages / Indexing** report-এ excluded URL ও errors দেখুন। পরে **Performance → Search results**-এ impressions, clicks, search query ও page report দেখুন।
8. Analytics ঐচ্ছিক: চাইলে Google Analytics 4 property তৈরি করে নিজের Measurement ID বসিয়ে আলাদা করে configure করুন। এখানে কোনো tracking ID বা analytics script যোগ করা হয়নি।

## Build, Preview ও Lighthouse

- `npm run lint` এবং `npm run build` দিয়ে code lint ও production build যাচাই করুন।
- Build শেষে `npm run preview` চালিয়ে Chrome DevTools → **Lighthouse** থেকে Mobile ও Desktop audit করুন। Performance, Accessibility, Best Practices এবং SEO-তে 90+ লক্ষ্য হতে পারে; score-এর নিশ্চয়তা নেই।
- SPA-তে React client-side title/meta পরিবর্তনকে পূর্ণ server-rendered SEO বলা যায় না। `view-source`-এ প্রাথমিক HTML দেখা যায়; কিছু social/search crawler JavaScript render নাও করতে পারে। Preview ও crawler পরীক্ষা করে প্রয়োজন হলে Vite-compatible prerendering বা SSR যোগ করুন; prerender করলে catalog/product data update করার ব্যবস্থাও ঠিক করুন।
- `robots.txt` private তথ্যের নিরাপত্তা দেয় না; `noindex`-ও access control নয়। বাস্তব customer/account/admin data-এর জন্য server/API authorization বাধ্যতামূলক।
