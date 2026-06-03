export type Post = {
  slug: string
  date: string
  readingTime: number
  author: { en: string; bn: string }
  category: { en: string; bn: string }
  coverImage: string
  coverAlt: string
  title: { en: string; bn: string }
  excerpt: { en: string; bn: string }
  content: { en: string; bn: string }
}

export const posts: Post[] = [
  {
    slug: 'apartment-service-charge-dhaka-guide',
    date: '2026-04-01',
    readingTime: 8,
    author: { en: 'BariShamlai', bn: 'বাড়ি সামলাই' },
    category: { en: 'Building Management', bn: 'ভবন ব্যবস্থাপনা' },
    coverImage: '/blog/sc-cover.jpg',
    coverAlt: 'Apartment building exterior',
    title: {
      en: 'How Much Should Apartment Service Charge Be?',
      bn: 'বিল্ডিংয়ের সার্ভিস চার্জ কত হওয়া উচিত?',
    },
    excerpt: {
      en: 'Every month landlords and tenants battle over service charges. This guide covers real figures for every major Dhaka neighbourhood, what belongs in service charges, and how to set a fair, transparent rate.',
      bn: 'প্রতি মাসে সার্ভিস চার্জ নিয়ে বাড়িওয়ালা বনাম ভাড়াটিয়ার দ্বন্দ্ব লেগেই থাকে। এই গাইডে ঢাকার প্রতিটি এলাকার বাস্তব সংখ্যা, কী কী খরচ ধরতে হয়, এবং ন্যায্য চার্জ কীভাবে নির্ধারণ করবেন তা বলা হয়েছে।',
    },
    content: {
      en: `> Every month, an invisible battle plays out between landlords and tenants over service charges. Tenants ask "why so much?" while building secretaries wonder "how do we cover costs with so little?" This guide covers real figures for every major Dhaka neighbourhood, what expenses belong in service charges, and how to set a fair, transparent rate for your specific building.

## What Is Service Charge, Really?

![Modern apartment buildings in a residential neighbourhood](/blog/sc-building.jpg)

Service charge is the monthly fee collected from each flat in an apartment building to cover the shared cost of running the building — security, cleaning, common area electricity, lift maintenance, caretaker wages, and more. It is entirely separate from rent and covers facilities that every resident uses equally, regardless of flat size.

Many tenants assume it is extra income for the building authority. In reality, a medium-sized building's monthly operating costs — wages, electricity, repairs — easily run into several lakh taka. Even divided across 30–40 flats, each flat's share is substantial and often more than tenants expect.

> **Data:** Staff wages (security and cleaning) and common area electricity together account for 60–70% of total maintenance costs — the two largest expense categories by a wide margin. (Source: NoBroker Hood, analysis of 30+ residential projects)

## What Expenses Belong in Service Charge?

Most building committees pick a number intuitively — often based on what neighbouring buildings charge or what was charged the previous year. The right method is to list every expense category, calculate a monthly total, and then divide by the number of flats. Here are the eight core components every service charge should cover:

| Component | Details |
|-----------|---------|
| 🔒 Security staff | Gate guard, CCTV monitoring, night watch. One guard's monthly wage: ৳8,000–৳15,000. |
| 🧹 Cleaning staff | Lifts, stairwells, rooftop, ground floor, parking area. 1–2 staff. Wage: ৳6,000–৳12,000/person. |
| 🏠 Caretaker | Bill collection, minor repair oversight, day-to-day management. Wage: ৳8,000–৳15,000. |
| ⚡ Common area electricity | Lifts, stairwell lighting, rooftop, water pump, CCTV, intercom. Monthly: ৳8,000–৳30,000. |
| 🛗 Lift maintenance (AMC) | Annual contract with lift company. ৳30,000–৳80,000/year = ৳2,500–৳7,000/month. |
| 🔧 Repairs & maintenance | Plumbing, generator servicing, paint, small fixes. Budget ৳3,000–৳15,000/month rolling average. |
| 💧 Water pump & WASA | Maintenance of pumps, overhead tanks, and WASA connection. Often overlooked but a regular expense. |
| 🏦 Sinking fund | Reserve for future major repairs. Experts recommend at least 0.75% of construction cost annually. |

## Service Charge by Dhaka Neighbourhood

![City skyline with residential buildings](/blog/sc-city.jpg)

The figures below are based on property listings, resident accounts, and building committee data collected from across Dhaka. Your building's age, amenities, staff count, and size will affect actual figures — treat this as a directional reference, not a fixed benchmark.

| Neighbourhood | Service Charge (per flat) | Avg. Rent | Level |
|---------------|--------------------------|-----------|-------|
| Gulshan, Baridhara | ৳15,000 – ৳40,000+ | ৳35,000 – ৳1,00,000+ | Premium |
| Banani, Niketan | ৳10,000 – ৳25,000 | ৳25,000 – ৳80,000 | High |
| Dhanmondi | ৳7,000 – ৳20,000 | ৳20,000 – ৳75,000 | Upper-mid |
| Bashundhara R/A | ৳5,000 – ৳12,000 | ৳18,000 – ৳50,000 | Mid |
| Uttara | ৳4,000 – ৳10,000 | ৳15,000 – ৳60,000 | Mid |
| Mohammadpur / Chandrima | ৳3,000 – ৳7,000 | ৳15,000 – ৳45,000 | Mid-budget |
| Mirpur DOHS | ৳4,000 – ৳9,000 | ৳15,000 – ৳50,000 | Mid |
| Mirpur (general) | ৳1,500 – ৳4,000 | ৳10,000 – ৳45,000 | Budget |
| Lalmatia, Shyamoli | ৳3,000 – ৳6,000 | ৳12,000 – ৳40,000 | Mid |

> **Warning:** Never blindly copy a neighbouring building's service charge. The fact that the building next door charges ৳5,000 means nothing for yours. Every building has a different cost structure — number of lifts, staff headcount, generator usage, and building age all vary significantly and independently.

## How to Calculate the Right Service Charge — 3 Steps

### Step 1 — List every expense and calculate monthly totals

Go through every expense your building incurs. For annual costs (like the lift AMC), divide by 12 to get the monthly share. Below is a worked example for a 20-flat building in Mohammadpur:

| Expense item | Monthly amount |
|--------------|---------------|
| Security guard (1 staff) | ৳10,000 |
| Cleaning staff (1 staff) | ৳8,000 |
| Caretaker | ৳10,000 |
| Common area electricity (lifts, lights, pump, CCTV) | ৳15,000 |
| Lift AMC (annual ৳48,000 ÷ 12) | ৳4,000 |
| Water pump & WASA | ৳3,000 |
| Minor repairs (monthly rolling average) | ৳5,000 |
| Sinking fund contribution | ৳5,000 |
| **Total ÷ 20 flats** | **৳60,000 ÷ 20 = ৳3,000/flat/month** |

### Step 2 — Add a 10–15% buffer

Add 10–15% to your calculated total to cover emergency repairs, annual price increases (electricity tariff hikes, minimum wage increases), and the reality that some residents will always pay late or not at all. This buffer goes directly into the sinking fund and protects the building's cash flow when unexpected expenses arise.

### Step 3 — Present it transparently to all residents

Share a brief income-expense breakdown with all residents when announcing the service charge — at the annual committee meeting, or when making any change. Show what was collected, what was spent, and what is in reserve. This single step reduces complaints by 70–80% in most buildings, because people stop questioning what they can clearly see.

> **Mistake to avoid:** "Last year it was ৳3,000, let's make it ৳3,500" — raising the charge with no explanation or calculation. This breeds suspicion, erodes trust, and causes late payments to multiply across the building.

## Which Distribution Method Should You Use?

**Method 1 — Equal split (recommended)**

Every flat pays the same amount regardless of size. Simple to calculate, fewer disputes, and easy to communicate. This is the most common method across Dhaka buildings because everyone uses roughly the same common facilities — the lift, the stairwell, the security guard, the cleaning staff.

**Method 2 — Per square foot basis**

Larger flats pay more, smaller flats pay less. Theoretically fairer in terms of proportional use of space, but in practice the calculation becomes complex and owners of larger flats consistently resist this method at committee meetings.

> **Advice:** For medium-sized Dhaka buildings (16–40 flats), the equal split method is by far the most practical. Simpler calculations mean easier collection and far fewer arguments at committee meetings. Save the per-sqft method for buildings with very large size differences between units.

## How to Raise Service Charge the Right Way

Service charge should be reviewed once a year — staff wages, electricity tariffs, and repair costs all increase annually. But how you raise it matters as much as the amount itself. Follow this process every time:

- Present a full income-expense report for the past 12 months at the annual committee meeting. Show every line item — what came in, what went out, what is in reserve.
- Present projected costs for the coming year with specific reasons for any increase (e.g. security guard wage increase, electricity tariff hike, lift AMC renewal).
- Take a formal vote or obtain written consent from building members for the proposed new rate before implementing it.
- Give at least 30 days' written notice before the new rate takes effect. Surprise increases never go down well.
- Communicate the reasons in writing — not just a WhatsApp message. A printed notice or a PDF creates a paper trail and signals that this is a considered decision.

## The Core of Transparent Management

![Building committee reviewing financial documents](/blog/sc-meeting.jpg)

Transparency is no longer optional. Residents are increasingly aware of their rights and expectations. Building committees that maintain clear accounts consistently collect more and face far fewer disputes than those that don't.

Create a brief monthly report showing: total collected, total spent, expense breakdown by category, and closing balance. Share it in the building WhatsApp group. The result — fewer arguments and faster payments, consistently every month.

> **Key takeaway:** The root cause of service charge disputes is not the amount — it is the lack of transparency. When people know exactly where their money goes, the same figure becomes acceptable. Transparency is the single most powerful tool a building committee has, and it costs nothing to implement.`,

      bn: `> প্রতি মাসে সার্ভিস চার্জ নিয়ে বাড়িওয়ালা বনাম ভাড়াটিয়ার একটা অদৃশ্য যুদ্ধ চলে। ভাড়াটিয়া ভাবেন "এত বেশি কেন?" আর বিল্ডিং সেক্রেটারি ভাবেন "এত কম দিয়ে কীভাবে খরচ মেটাবো?" এই লেখায় ঢাকার প্রতিটি প্রধান এলাকার বাস্তব সংখ্যা, সার্ভিস চার্জে কী কী খরচ ধরতে হয়, এবং ন্যায়সঙ্গত চার্জ কীভাবে নির্ধারণ করবেন — সব মিলিয়ে একটি সম্পূর্ণ গাইড।

## সার্ভিস চার্জ আসলে কী?

![আবাসিক এলাকায় আধুনিক অ্যাপার্টমেন্ট ভবন](/blog/sc-building.jpg)

সার্ভিস চার্জ হলো একটি অ্যাপার্টমেন্ট বিল্ডিংয়ের সাধারণ সুবিধা এবং পরিষেবা পরিচালনার জন্য প্রতিটি ফ্লোরের বাসিন্দাদের থেকে মাসে মাসে সংগ্রহ করা অর্থ। এটি ভাড়ার অতিরিক্ত একটি আলাদা খরচ — ভবনের সকলের জন্য সমান সুবিধা নিশ্চিত করে: নিরাপত্তা, পরিচ্ছন্নতা, লিফট, পানির পাম্প, কেয়ারটেকার — সবই এর অন্তর্ভুক্ত।

অনেক ভাড়াটিয়া মনে করেন এটি বিল্ডিং কর্তৃপক্ষের বাড়তি আয়ের পথ। কিন্তু সঠিকভাবে হিসাব করলে দেখা যায় — একটি মাঝারি আকারের বিল্ডিংয়ে প্রতি মাসে কর্মীদের বেতন, বিদ্যুৎ বিল এবং মেরামত মিলিয়ে খরচ হয় কয়েক লাখ টাকা। ৩০–৪০ ফ্লোরে ভাগ করলেও প্রতি ফ্লোরে উল্লেখযোগ্য অঙ্কই দাঁড়ায়।

> **তথ্য:** গবেষণা দেখায় যে আবাসিক সমিতির রক্ষণাবেক্ষণ চার্জের সবচেয়ে বড় দুটি ব্যয়-খাত হলো জনবল (নিরাপত্তা ও পরিষ্কার কর্মী) এবং সাধারণ এলাকার বিদ্যুৎ বিল — এই দুটি মিলে মোট খরচের ৬০–৭০%। (সূত্র: NoBroker Hood, ৩০+ আবাসিক প্রকল্পের বিশ্লেষণ)

## সার্ভিস চার্জে কী কী খরচ ধরতে হয়?

বেশিরভাগ বিল্ডিং কমিটি মনমতো একটা সংখ্যা ঠিক করে নেয় — প্রায়ই পাশের বিল্ডিং কত নেয় বা আগের বছর কত ছিল তার ভিত্তিতে। সঠিক পদ্ধতি হলো প্রতিটি খরচের খাত তালিকা করা, মাসিক মোট হিসাব করা, তারপর ফ্লোর সংখ্যা দিয়ে ভাগ করা। নিচে সার্ভিস চার্জের আটটি মূল উপাদান:

| উপাদান | বিবরণ |
|--------|-------|
| 🔒 নিরাপত্তা কর্মী | গেট গার্ড, সিসিটিভি মনিটরিং, রাতের প্রহরী। একজন গার্ডের মাসিক বেতন ৳৮,০০০–৳১৫,০০০। |
| 🧹 পরিচ্ছন্নতা কর্মী | লিফট, সিঁড়ি, ছাদ, নিচতলা, পার্কিং এলাকা পরিষ্কার। সাধারণত ১–২ জন। বেতন ৳৬,০০০–৳১২,০০০/জন। |
| 🏠 কেয়ারটেকার | বিল সংগ্রহ, ছোট মেরামত তদারকি, সামগ্রিক দৈনন্দিন ব্যবস্থাপনা। বেতন ৳৮,০০০–৳১৫,০০০। |
| ⚡ সাধারণ বিদ্যুৎ বিল | লিফট, সিঁড়িঘরের আলো, ছাদ, পানির পাম্প, সিসিটিভি, ইন্টারকম। মাসে ৳৮,০০০–৳৩০,০০০। |
| 🛗 লিফট রক্ষণাবেক্ষণ (AMC) | লিফট কোম্পানির বার্ষিক সার্ভিসিং চুক্তি। বার্ষিক ৳৩০,০০০–৳৮০,০০০, মাসিক হিসাবে ৳২,৫০০–৳৭,০০০। |
| 🔧 রক্ষণাবেক্ষণ ও মেরামত | পানির পাইপ, জেনারেটর সার্ভিস, রং-লেস্তারা, ছোটখাট ঠিকঠাক। মাসিক গড় ৳৩,০০০–৳১৫,০০০। |
| 💧 পানির পাম্প ও ওয়াসা | সাধারণ এলাকার পানি সরবরাহ এবং পাম্প মেশিন রক্ষণাবেক্ষণ খরচ। প্রায়ই উপেক্ষিত কিন্তু নিয়মিত খরচ। |
| 🏦 সিংকিং ফান্ড | ভবিষ্যৎ বড় মেরামতের রিজার্ভ। বিশেষজ্ঞরা নির্মাণ মূল্যের ০.৭৫% বার্ষিক সুপারিশ করেন। |

## ঢাকার এলাকাভিত্তিক সার্ভিস চার্জ তুলনা

![শহরের আকাশরেখা — আবাসিক ভবনের সারি](/blog/sc-city.jpg)

নিচের তথ্য সম্পত্তির বিজ্ঞাপন, বাসিন্দাদের অভিজ্ঞতা এবং বিভিন্ন এলাকার বিল্ডিং কমিটির তথ্যের উপর ভিত্তি করে তৈরি। আপনার বিল্ডিংয়ের বয়স, সুবিধা, কর্মী সংখ্যা এবং আকারের উপর নির্ভর করে পার্থক্য হতে পারে — এটি একটি আনুমানিক রেফারেন্স, নিশ্চিত মানদণ্ড নয়।

| এলাকা | সার্ভিস চার্জ (প্রতি ফ্লোর) | গড় ভাড়া | মাত্রা |
|-------|--------------------------|---------|-------|
| গুলশান, বারিধারা | ৳১৫,০০০ – ৳৪০,০০০+ | ৳৩৫,০০০ – ৳১,০০,০০০+ | প্রিমিয়াম |
| বনানী, নিকেতন | ৳১০,০০০ – ৳২৫,০০০ | ৳২৫,০০০ – ৳৮০,০০০ | উচ্চ |
| ধানমণ্ডি | ৳৭,০০০ – ৳২০,০০০ | ৳২০,০০০ – ৳৭৫,০০০ | উচ্চ-মধ্যম |
| বসুন্ধরা R/A | ৳৫,০০০ – ৳১২,০০০ | ৳১৮,০০০ – ৳৫০,০০০ | মধ্যম |
| উত্তরা | ৳৪,০০০ – ৳১০,০০০ | ৳১৫,০০০ – ৳৬০,০০০ | মধ্যম |
| মোহাম্মদপুর / চন্দ্রিমা | ৳৩,০০০ – ৳৭,০০০ | ৳১৫,০০০ – ৳৪৫,০০০ | মধ্যম-বাজেট |
| মিরপুর DOHS | ৳৪,০০০ – ৳৯,০০০ | ৳১৫,০০০ – ৳৫০,০০০ | মধ্যম |
| মিরপুর (সাধারণ) | ৳১,৫০০ – ৳৪,০০০ | ৳১০,০০০ – ৳৪৫,০০০ | বাজেট |
| লালমাটিয়া, শ্যামলী | ৳৩,০০০ – ৳৬,০০০ | ৳১২,০০০ – ৳৪০,০০০ | মধ্যম |

> **সতর্কতা:** এলাকার গড় দিয়ে অন্ধভাবে চার্জ ঠিক করবেন না। পাশের বিল্ডিং ৳৫,০০০ নেয় মানে আপনারও ৳৫,০০০ নেওয়া উচিত — এই যুক্তি ভুল। প্রতিটি বিল্ডিংয়ের খরচের কাঠামো ভিন্ন — লিফটের সংখ্যা, কর্মী সংখ্যা, জেনারেটর ব্যবহার, বিল্ডিংয়ের বয়স — সব আলাদা।

## সঠিকভাবে সার্ভিস চার্জ হিসাব করুন — ৩টি ধাপ

### ধাপ ১ — প্রতিটি খরচ তালিকা করে মাসিক মোট বের করুন

প্রতিটি খরচের খাত লিস্ট করুন এবং মাসিক অঙ্ক বের করুন। বার্ষিক খরচ (যেমন লিফট AMC) ১২ দিয়ে ভাগ করুন। নিচে মোহাম্মদপুর এলাকার একটি ২০-ফ্লোর মাঝারি বিল্ডিংয়ের বাস্তব উদাহরণ:

| খরচের খাত | মাসিক পরিমাণ |
|----------|------------|
| নিরাপত্তা গার্ড (১ জন) | ৳১০,০০০ |
| পরিচ্ছন্নতা কর্মী (১ জন) | ৳৮,০০০ |
| কেয়ারটেকার | ৳১০,০০০ |
| সাধারণ বিদ্যুৎ (লিফট, আলো, পাম্প, সিসিটিভি) | ৳১৫,০০০ |
| লিফট AMC (বার্ষিক ৳৪৮,০০০ ÷ ১২) | ৳৪,০০০ |
| পানির পাম্প ও ওয়াসা | ৳৩,০০০ |
| ছোট মেরামত (মাসিক গড়) | ৳৫,০০০ |
| সিংকিং ফান্ড | ৳৫,০০০ |
| **মোট ÷ ২০ ফ্লোর** | **৳৬০,০০০ ÷ ২০ = ৳৩,০০০/ফ্লোর/মাস** |

### ধাপ ২ — ১০–১৫% বাফার যোগ করুন

হঠাৎ মেরামত, বার্ষিক দাম বৃদ্ধি এবং অনাদায়ী চার্জের জন্য মোট খরচের উপর ১০–১৫% বাড়তি রাখুন। এটি সিংকিং ফান্ডে জমা হবে এবং পাম্প বা লিফটের বড় মেরামতের সময় বিল্ডিংয়ের ক্যাশ ফ্লো রক্ষা করবে।

### ধাপ ৩ — বাসিন্দাদের সামনে স্বচ্ছভাবে উপস্থাপন করুন

সার্ভিস চার্জ ঘোষণার সময় সকল বাসিন্দাকে একটি সংক্ষিপ্ত আয়-ব্যয়ের বিবরণ দিন — বার্ষিক কমিটি সভায় বা যেকোনো পরিবর্তনের সময়। কত সংগ্রহ হয়েছে, কত খরচ হয়েছে এবং রিজার্ভে কত আছে — এটা দেখান। এই একটি পদক্ষেপ বেশিরভাগ বিল্ডিংয়ে অভিযোগ ৭০–৮০% কমিয়ে দেয়।

> **সবচেয়ে বড় ভুল:** "গত বছর ৳৩,০০০ ছিল, এবার ৳৩,৫০০ করে দিই" — কোনো হিসাব বা কারণ ছাড়াই বাড়িয়ে দেওয়া। এতে ভাড়াটিয়ার সন্দেহ তৈরি হয়, বিশ্বাস ভাঙে, এবং পেমেন্টে দেরি শুরু হয়।

## কোন পদ্ধতিতে ভাগ করবেন?

**পদ্ধতি ১ — সমান ভাগ (সুপারিশকৃত)**

প্রতিটি ফ্লোর সমান চার্জ দেয়, বড় হোক ছোট হোক। সহজ হিসাব, তর্ক কম, সংগ্রহ সহজ। ঢাকার বেশিরভাগ বিল্ডিংয়ে এটিই প্রচলিত। কারণ সবাই মোটামুটি একই সুবিধা ব্যবহার করেন — লিফট, সিঁড়িঘর, নিরাপত্তা গার্ড, পরিচ্ছন্নতা কর্মী।

**পদ্ধতি ২ — স্কয়ার ফুট ভিত্তিক**

বড় ফ্লোর বেশি দেয়, ছোট ফ্লোর কম। তাত্ত্বিকভাবে ন্যায়সঙ্গত, কিন্তু বাস্তবে হিসাব জটিল হয় এবং বড় ফ্লোরের মালিকরা কমিটি সভায় প্রায়ই এই পদ্ধতিতে রাজি হন না।

> **পরামর্শ:** ঢাকার মাঝারি আকারের (১৬–৪০ ফ্লোর) বিল্ডিংয়ের জন্য সমান ভাগ পদ্ধতিই সবচেয়ে কার্যকর। সহজ হিসাব মানে সহজ সংগ্রহ এবং কম তর্ক। ফ্লোরের আকারে অনেক বড় পার্থক্য থাকলে তখনই কেবল স্কয়ার ফুট পদ্ধতি বিবেচনা করুন।

## সার্ভিস চার্জ বাড়ানোর সঠিক পদ্ধতি

বছরে একবার সার্ভিস চার্জ পর্যালোচনা করা উচিত — কর্মীদের বেতন, বিদ্যুৎ বিল এবং মেরামত খরচ সবই প্রতি বছর বাড়ে। কিন্তু বাড়ানোর পদ্ধতিটা পরিমাণের মতোই গুরুত্বপূর্ণ। প্রতিবার এই প্রক্রিয়া অনুসরণ করুন:

- বার্ষিক কমিটি সভায় গত ১২ মাসের আয়-ব্যয়ের পূর্ণ হিসাব উপস্থাপন করুন। প্রতিটি লাইন আইটেম দেখান — কত এলো, কোথায় গেল, রিজার্ভে কত আছে।
- আগামী বছরের আনুমানিক খরচ দেখান। বৃদ্ধির সুনির্দিষ্ট কারণ উল্লেখ করুন — যেমন নিরাপত্তা কর্মীর বেতন বৃদ্ধি, বিদ্যুৎ ট্যারিফ বৃদ্ধি, লিফট AMC নবায়ন।
- প্রস্তাবিত নতুন চার্জ বাস্তবায়নের আগে আনুষ্ঠানিক ভোট নিন বা বিল্ডিং সদস্যদের লিখিত সম্মতি নিন।
- নতুন হার কার্যকর হওয়ার অন্তত ৩০ দিন আগে লিখিত নোটিশ দিন। হঠাৎ বাড়ানো কখনো কাজ করে না।
- কারণগুলো লিখিতভাবে জানান — শুধু হোয়াটসঅ্যাপ বার্তা নয়। একটি প্রিন্ট করা নোটিশ বা PDF সিদ্ধান্তের গুরুত্ব প্রকাশ করে এবং ভবিষ্যতের জন্য রেকর্ড রাখে।

## স্বচ্ছ ব্যবস্থাপনার মূল কথা

![বিল্ডিং কমিটির সদস্যরা আর্থিক নথি পর্যালোচনা করছেন](/blog/sc-meeting.jpg)

স্বচ্ছতা এখন আর ঐচ্ছিক নয়। বাসিন্দারা ক্রমশ সচেতন হচ্ছেন এবং তাদের অধিকার সম্পর্কে জানছেন। যে বিল্ডিং কমিটি হিসাব স্বচ্ছভাবে রাখে, তাদের সংগ্রহ বেশি এবং অভিযোগ কম — এটি বারবার প্রমাণিত।

প্রতি মাসে একটি সংক্ষিপ্ত রিপোর্ট তৈরি করুন: মোট সংগ্রহ, মোট ব্যয়, খরচের খাত এবং ব্যালেন্স। এটি বিল্ডিংয়ের হোয়াটসঅ্যাপ গ্রুপে শেয়ার করুন। ফলাফল — যে বিল্ডিংগুলো এটি করে তাদের অভিজ্ঞতা অনুযায়ী — প্রতি মাসেই কম তর্ক এবং দ্রুত পেমেন্ট।

> **মূল কথা:** সার্ভিস চার্জ নিয়ে বিবাদের মূল কারণ পরিমাণ নয়, অস্বচ্ছতা। মানুষ যখন জানেন টাকাটা ঠিক কোথায় যাচ্ছে, তখন একই পরিমাণও গ্রহণযোগ্য হয়ে যায়। স্বচ্ছতা হলো একটি বিল্ডিং কমিটির কাছে সবচেয়ে শক্তিশালী হাতিয়ার — এবং এটি বাস্তবায়নে কোনো খরচ নেই।`,
    },
  },
  {
    slug: 'how-to-collect-rent-on-time',
    date: '2025-03-15',
    readingTime: 5,
    author: { en: 'BariShamlai', bn: 'বাড়ি সামলাই' },
    category: { en: 'Rent Collection', bn: 'ভাড়া সংগ্রহ' },
    coverImage: '/blog/rent-cover.jpg',
    coverAlt: 'Cash money and financial documents',
    title: {
      en: 'How to collect rent on time — every month',
      bn: 'প্রতি মাসে সময়মতো ভাড়া আদায়ের উপায়',
    },
    excerpt: {
      en: 'Late rent is the most common headache for Bangladeshi landlords. Here are five proven strategies to get paid on time, every time.',
      bn: 'দেরিতে ভাড়া পাওয়া বাংলাদেশের বাড়িওয়ালাদের সবচেয়ে বড় সমস্যা। সময়মতো ভাড়া পাওয়ার পাঁচটি কার্যকর কৌশল এখানে দেওয়া হলো।',
    },
    content: {
      en: `![A landlord and tenant reviewing a rental agreement](/blog/rent-signing.jpg)

Late rent disrupts cash flow and strains landlord-tenant relationships. After talking to hundreds of property managers across Bangladesh, we've distilled the best practices into five actionable steps.

## 1. Set a clear due date in the lease

Your tenancy agreement should specify the exact due date — usually the 1st to 5th of each month. Vague language like "beginning of the month" leads to confusion. A hard date removes ambiguity.

## 2. Send automated reminders

A reminder 3 days before the due date and one on the due date itself dramatically reduces late payments. With Bari Shamlai, these messages go out automatically via SMS or in-app notification — no manual follow-up needed.

## 3. Charge a small late fee

A nominal late fee (1–2% of monthly rent) after a 5-day grace period creates a real incentive to pay on time. Make sure this is clearly written in the lease so tenants expect it.

## 4. Offer multiple payment channels

The easier you make it to pay, the fewer excuses tenants have. Accept bKash, Nagad, bank transfer, and cash — and confirm receipt immediately with a digital receipt from Bari Shamlai.

## 5. Build a relationship, not just a contract

Tenants who feel respected are more likely to communicate proactively when cash is tight. A quick check-in during move-in and at renewal time goes a long way toward reducing payment friction.

---

Following these five steps consistently will eliminate most late-payment situations before they become a problem.`,
      bn: `![বাড়িওয়ালা এবং ভাড়াটে ভাড়া চুক্তি পর্যালোচনা করছেন](/blog/rent-signing.jpg)

দেরিতে ভাড়া পাওয়া নগদ প্রবাহ ব্যাহত করে এবং বাড়িওয়ালা-ভাড়াটে সম্পর্ককে ক্ষতিগ্রস্ত করে। বাংলাদেশের শত শত সম্পত্তি ব্যবস্থাপকের সাথে কথা বলে আমরা পাঁচটি কার্যকর পদক্ষেপ তৈরি করেছি।

## ১. চুক্তিতে স্পষ্ট মেয়াদ নির্ধারণ করুন

ভাড়া চুক্তিতে নির্দিষ্ট তারিখ উল্লেখ করুন — সাধারণত মাসের ১ থেকে ৫ তারিখের মধ্যে। "মাসের শুরুতে" এই ধরনের অস্পষ্ট ভাষা বিভ্রান্তি তৈরি করে।

## ২. স্বয়ংক্রিয় অনুস্মারক পাঠান

নির্ধারিত তারিখের ৩ দিন আগে এবং সেদিনই একটি অনুস্মারক পাঠানো দেরিতে পেমেন্ট উল্লেখযোগ্যভাবে কমায়। বাড়ি সামলাইয়ের মাধ্যমে এটি স্বয়ংক্রিয়ভাবে হয়।

## ৩. বিলম্ব ফি আরোপ করুন

৫ দিনের গ্রেস পিরিয়ডের পরে মাসিক ভাড়ার ১-২% বিলম্ব ফি সময়মতো পেমেন্টের জন্য একটি বাস্তব প্রণোদনা তৈরি করে।

## ৪. একাধিক পেমেন্ট চ্যানেল অফার করুন

বিকাশ, নগদ, ব্যাংক ট্রান্সফার এবং নগদ অর্থ গ্রহণ করুন — এবং বাড়ি সামলাই থেকে ডিজিটাল রসিদ দিয়ে তাৎক্ষণিক নিশ্চিত করুন।

## ৫. শুধু চুক্তি নয়, সম্পর্ক গড়ুন

যে ভাড়াটেরা সম্মানিত বোধ করেন তারা আর্থিক সমস্যার সময় আগেভাগে জানান। প্রবেশের সময় এবং নবায়নের সময় একটু খোঁজখবর নেওয়া পেমেন্ট সমস্যা অনেকটাই কমায়।`,
    },
  },
  {
    slug: 'digital-receipts-vs-paper',
    date: '2025-04-02',
    readingTime: 4,
    author: { en: 'BariShamlai', bn: 'বাড়ি সামলাই' },
    category: { en: 'Property Management', bn: 'সম্পত্তি ব্যবস্থাপনা' },
    coverImage: '/blog/receipts-cover.jpg',
    coverAlt: 'Person using smartphone for digital payments',
    title: {
      en: 'Digital receipts vs. paper receipts: why the switch matters',
      bn: 'ডিজিটাল বনাম কাগজের রসিদ: পরিবর্তন কেন জরুরি',
    },
    excerpt: {
      en: 'Paper receipts get lost, fade, and create disputes. Digital receipts are instant, searchable, and legally robust. Here is why you should make the switch today.',
      bn: 'কাগজের রসিদ হারিয়ে যায়, বিবর্ণ হয় এবং বিরোধ তৈরি করে। ডিজিটাল রসিদ তাৎক্ষণিক, অনুসন্ধানযোগ্য এবং আইনগতভাবে শক্তিশালী।',
    },
    content: {
      en: `![Digital receipt displayed on a smartphone screen](/blog/receipts-inline.jpg)

For decades, landlords in Bangladesh have handed over handwritten paper receipts after collecting rent. It works — until it doesn't. A faded receipt, a lost book, or a disputed payment can turn a simple transaction into a months-long conflict.

## The problems with paper

- **Lost or damaged.** Paper receipts can be misplaced by either party, especially in multi-unit buildings with dozens of transactions per month.
- **No audit trail.** Paper records are difficult to aggregate for tax filing or dispute resolution.
- **No backup.** If the receipt book is destroyed, the record is gone.

## What digital receipts solve

**Instant delivery.** The moment a payment is recorded in Bari Shamlai, a PDF receipt is generated and can be sent to the tenant via email or shared directly — no printing required.

**Searchable history.** Every receipt is stored in the cloud. Search by tenant, unit, month, or amount in seconds.

**Tamper-evident.** Digital receipts include a timestamp and a unique ID, making disputes far easier to resolve.

**Professional appearance.** A well-formatted digital receipt with your building's branding signals that you run a modern, professional operation — which attracts better tenants.

## Getting started

If you're already using Bari Shamlai, receipts are generated automatically when you record a payment. You can resend any past receipt at any time from the Receipts section of your dashboard.`,
      bn: `![স্মার্টফোন স্ক্রিনে ডিজিটাল রসিদ](/blog/receipts-inline.jpg)

বছরের পর বছর ধরে বাংলাদেশের বাড়িওয়ালারা ভাড়া নেওয়ার পরে হাতে লেখা কাগজের রসিদ দিয়ে আসছেন। এটি কাজ করে — যতক্ষণ না কোনো সমস্যা হয়।

## কাগজের সমস্যা

- **হারিয়ে যাওয়া বা ক্ষতিগ্রস্ত।** কাগজের রসিদ যেকোনো পক্ষ হারিয়ে ফেলতে পারে।
- **কোনো অডিট ট্রেইল নেই।** কর ফাইলিং বা বিরোধ নিষ্পত্তির জন্য কাগজের রেকর্ড একত্রিত করা কঠিন।
- **কোনো ব্যাকআপ নেই।** রসিদ বই নষ্ট হলে রেকর্ড চলে যায়।

## ডিজিটাল রসিদ কী সমাধান করে

**তাৎক্ষণিক ডেলিভারি।** বাড়ি সামলাইতে পেমেন্ট রেকর্ড হওয়ার সাথে সাথে একটি পিডিএফ রসিদ তৈরি হয় এবং ইমেইলে পাঠানো যায়।

**অনুসন্ধানযোগ্য ইতিহাস।** প্রতিটি রসিদ ক্লাউডে সংরক্ষিত থাকে। ভাড়াটে, ইউনিট, মাস বা পরিমাণ অনুযায়ী সেকেন্ডে খুঁজুন।

**পেশাদার চেহারা।** একটি সুন্দরভাবে ফর্ম্যাট করা ডিজিটাল রসিদ দেখায় যে আপনি একটি আধুনিক, পেশাদার অপারেশন চালাচ্ছেন।`,
    },
  },
  {
    slug: 'managing-multiple-buildings',
    date: '2025-05-10',
    readingTime: 6,
    author: { en: 'BariShamlai', bn: 'বাড়ি সামলাই' },
    category: { en: 'Scaling Up', bn: 'সম্প্রসারণ' },
    coverImage: '/blog/buildings-cover.jpg',
    coverAlt: 'Aerial view of a city with multiple residential buildings',
    title: {
      en: 'Managing multiple buildings without losing your mind',
      bn: 'একাধিক ভবন সামলানোর স্মার্ট উপায়',
    },
    excerpt: {
      en: 'Once you own more than one building, complexity grows fast. Learn the systems and tools that keep multi-property management sane and profitable.',
      bn: 'একটির বেশি ভবন থাকলে জটিলতা দ্রুত বাড়ে। মাল্টি-প্রপার্টি ব্যবস্থাপনাকে সহজ ও লাভজনক রাখার পদ্ধতি জানুন।',
    },
    content: {
      en: `![Dense urban neighbourhood with many apartment buildings](/blog/buildings-inline.jpg)

Growing from one building to two — then five — feels exciting until you realize you're drowning in spreadsheets, missed calls, and conflicting records. Here is how experienced multi-property owners in Bangladesh stay on top of it all.

## Centralize everything in one platform

The biggest mistake multi-property owners make is using a separate system for each building. One building gets a spreadsheet, another gets a WhatsApp group, and a third gets a notebook. When something goes wrong, you can't see the full picture.

A single platform like Bari Shamlai lets you see all buildings, all units, and all outstanding payments on one screen.

## Standardize your processes

Every building should have the same lease template, the same due dates, the same late-fee policy, and the same onboarding checklist for new tenants. Standardization means you can delegate without retraining someone every time.

## Hire a building caretaker per building

Once you're managing more than 8–10 units in a single building, a full-time caretaker becomes cost-effective. Their job: collect rent physically, report maintenance issues, and be the first point of contact for tenants. Your job becomes oversight, not operations.

## Run monthly financial reviews

Once a month, review:
- Total rent collected vs. expected
- Outstanding balances
- Expense-to-revenue ratio per building
- Any units vacant longer than 30 days

Bari Shamlai's monthly report feature generates this summary automatically.

## Know when to bring in professional management

If you cross 50 units, consider whether a professional property management company — one that charges 8–12% of collected rent — frees enough of your time to justify the cost.`,
      bn: `![একটি ঘন শহুরে এলাকায় অনেক অ্যাপার্টমেন্ট ভবন](/blog/buildings-inline.jpg)

একটি থেকে দুটি — তারপর পাঁচটি ভবনে বাড়ার পরে উত্তেজনা অনুভব হয় যতক্ষণ না বুঝতে পারেন যে আপনি স্প্রেডশিট, মিসড কল এবং সাংঘর্ষিক রেকর্ডে ডুবে যাচ্ছেন।

## সবকিছু একটি প্ল্যাটফর্মে কেন্দ্রীভূত করুন

মাল্টি-প্রপার্টি মালিকদের সবচেয়ে বড় ভুল হলো প্রতিটি ভবনের জন্য আলাদা সিস্টেম ব্যবহার করা। বাড়ি সামলাই আপনাকে একটি স্ক্রিনে সমস্ত ভবন, সমস্ত ইউনিট এবং সমস্ত বকেয়া পেমেন্ট দেখতে দেয়।

## আপনার প্রক্রিয়া মানসম্মত করুন

প্রতিটি ভবনে একই লিজ টেমপ্লেট, একই মেয়াদ, একই বিলম্ব-ফি নীতি এবং নতুন ভাড়াটেদের জন্য একই অনবোর্ডিং চেকলিস্ট থাকা উচিত।

## প্রতি ভবনে একজন কেয়ারটেকার নিয়োগ করুন

একটি ভবনে ৮-১০টির বেশি ইউনিট থাকলে একজন পূর্ণকালীন কেয়ারটেকার সাশ্রয়ী হয়ে ওঠে।

## মাসিক আর্থিক পর্যালোচনা করুন

প্রতি মাসে পর্যালোচনা করুন: সংগৃহীত বনাম প্রত্যাশিত ভাড়া, বকেয়া ব্যালেন্স, প্রতিটি ভবনের ব্যয়-আয় অনুপাত। বাড়ি সামলাইয়ের মাসিক রিপোর্ট ফিচার স্বয়ংক্রিয়ভাবে এই সারাংশ তৈরি করে।`,
    },
  },
  {
    slug: 'avoid-rent-hike-conflict-dhaka',
    date: '2026-04-05',
    readingTime: 7,
    author: { en: 'BariShamlai', bn: 'বাড়ি সামলাই' },
    category: { en: 'Landlord Tips', bn: 'বাড়িওয়ালার পরামর্শ' },
    coverImage: '/blog/rent-cover.jpg',
    coverAlt: 'Landlord and tenant discussing a rental agreement',
    title: {
      en: 'Navigating Rent Hikes Legally and Professionally in Dhaka',
      bn: 'ঢাকায় ভাড়া বৃদ্ধি — আইনি ও পেশাদার উপায়',
    },
    excerpt: {
      en: 'Raising rent is your right as a landlord — but how you do it determines whether you keep a good tenant or trigger a costly conflict. This guide covers the legal framework and practical steps for Dhaka.',
      bn: 'ভাড়া বাড়ানো আপনার অধিকার — কিন্তু কীভাবে করছেন সেটাই নির্ধারণ করে ভালো ভাড়াটে রাখবেন নাকি ব্যয়বহুল দ্বন্দ্বে পড়বেন। এই গাইডে ঢাকার আইনি কাঠামো ও ব্যবহারিক পদক্ষেপ আলোচনা করা হয়েছে।',
    },
    content: {
      en: `> Raising rent without warning is the single fastest way to lose a good tenant. But never raising rent means your real income erodes every year with inflation. The answer is process — and Bangladesh law actually gives landlords a clear path.

## What the Law Says

![Landlord and tenant reviewing a rental contract](/blog/rent-signing.jpg)

Bangladesh's Premises Rent Control Act and its successor regulations require landlords to give **advance written notice** before any rent increase. The standard is:

- **Minimum 30 days' written notice** before the new rent takes effect
- Notice must state the **new amount**, the **effective date**, and the **reason** (optional but advisable)
- Hikes above a certain percentage in controlled areas may require local authority approval — check with RAJUK or your City Corporation ward office

In practice, most Dhaka landlords and tenants operate on informal agreements. Written notice is rarely given. This is exactly why conflicts happen — tenants feel ambushed; landlords feel their reasonable request was ignored.

## How Much Can You Raise?

There is no universally mandated cap in uncontrolled market areas of Dhaka, but practical norms have emerged:

| Market Condition | Typical Annual Hike | Notes |
|-----------------|--------------------|----|
| Inflation-tracking | 5–8% | Common in mid-range areas |
| Below-market correction | 10–15% | When rent was frozen for years |
| Premium area upgrades | Up to 20% | After significant renovation |

Going above 15% in one step almost always results in tenant departure or dispute. Consider splitting a large correction over two years.

## The 5-Step Process for a Conflict-Free Rent Hike

**Step 1 — Research the market first.** Before quoting a new number, check what comparable flats in your neighbourhood are renting for. Tenants will do this research too. An evidence-based number is far easier to defend.

**Step 2 — Give at least 60 days' notice, not 30.** Legally you need 30, but 60 days signals respect and gives a good tenant time to plan financially. This alone dramatically reduces friction.

**Step 3 — Deliver notice in writing.** A WhatsApp message is not enough. Write a short letter or typed notice, sign it, and give one copy to the tenant. Keep a copy for yourself. Bari Shamlai lets you log this in the tenant's file.

**Step 4 — Explain the reason briefly.** "Our maintenance costs have risen 18% this year and this is the first increase in two years" is far more persuasive than a number with no context.

**Step 5 — Be open to a small negotiation window.** If a tenant counters with a modest reduction, consider accepting. Keeping a reliable, quiet tenant at ৳1,000 below your ask is better than three months vacant while finding a replacement.

## What to Do If the Tenant Refuses

If a tenant refuses to accept the new rate and you cannot reach agreement:
1. Issue formal written notice to vacate (typically 30–60 days depending on your agreement)
2. Document all communication
3. Do not cut utilities or enter without notice — these actions expose you to legal liability
4. If the tenant refuses to leave after proper notice, file a case with the local Rent Controller or pursue eviction through the civil court

Prevention is always cheaper than dispute. A professional process — written notice, fair amount, clear timeline — resolves 90% of rent-hike conversations without conflict.`,
      bn: `> বিনা নোটিশে ভাড়া বাড়ানো একজন ভালো ভাড়াটে হারানোর সবচেয়ে দ্রুত উপায়। কিন্তু কখনো না বাড়ালে মুদ্রাস্ফীতির সাথে আপনার আসল আয় প্রতি বছর কমে। সমাধান হলো প্রক্রিয়া — এবং বাংলাদেশের আইন বাড়িওয়ালাদের জন্য একটি স্পষ্ট পথ দেয়।

## আইন কী বলে

বাংলাদেশের প্রিমিসেস রেন্ট কন্ট্রোল আইন অনুযায়ী, যেকোনো ভাড়া বৃদ্ধির আগে বাড়িওয়ালাকে **আগাম লিখিত নোটিশ** দিতে হবে:

- নতুন ভাড়া কার্যকর হওয়ার আগে **ন্যূনতম ৩০ দিনের লিখিত নোটিশ**
- নোটিশে **নতুন পরিমাণ**, **কার্যকর তারিখ** এবং **কারণ** উল্লেখ থাকতে হবে
- নিয়ন্ত্রিত এলাকায় নির্দিষ্ট শতাংশের বেশি বৃদ্ধিতে স্থানীয় কর্তৃপক্ষের অনুমোদন লাগতে পারে

## কতটুকু বাড়াতে পারবেন?

| বাজার পরিস্থিতি | স্বাভাবিক বার্ষিক বৃদ্ধি | মন্তব্য |
|----------------|------------------------|---------|
| মুদ্রাস্ফীতি ট্র্যাকিং | ৫–৮% | মধ্যবিত্ত এলাকায় সাধারণ |
| বাজারের নিচে সংশোধন | ১০–১৫% | দীর্ঘদিন ভাড়া না বাড়লে |
| প্রিমিয়াম এলাকা আপগ্রেড | ২০% পর্যন্ত | উল্লেখযোগ্য সংস্কারের পরে |

## দ্বন্দ্বমুক্ত ভাড়া বৃদ্ধির ৫ ধাপ

**ধাপ ১ — আগে বাজার গবেষণা করুন।** নতুন ভাড়া বলার আগে আপনার এলাকায় একই মানের ফ্ল্যাটের ভাড়া যাচাই করুন। প্রমাণভিত্তিক সংখ্যা সহজে গৃহীত হয়।

**ধাপ ২ — ৩০ নয়, ৬০ দিনের নোটিশ দিন।** আইনি প্রয়োজন ৩০ দিন, কিন্তু ৬০ দিন সম্মান দেখায় এবং ভালো ভাড়াটেকে আর্থিক পরিকল্পনার সময় দেয়।

**ধাপ ৩ — লিখিতভাবে নোটিশ দিন।** হোয়াটসঅ্যাপ বার্তা যথেষ্ট নয়। একটি ছোট চিঠি বা টাইপ করা নোটিশ লিখুন, স্বাক্ষর করুন এবং একটি কপি ভাড়াটেকে দিন।

**ধাপ ৪ — সংক্ষেপে কারণ ব্যাখ্যা করুন।** "আমাদের রক্ষণাবেক্ষণ খরচ এই বছর ১৮% বেড়েছে এবং দুই বছরে এটাই প্রথম বৃদ্ধি" — এটি শুধু সংখ্যার চেয়ে অনেক বেশি কার্যকর।

**ধাপ ৫ — সামান্য আলোচনার সুযোগ রাখুন।** একজন বিশ্বস্ত, শান্ত ভাড়াটেকে ১,০০০ টাকা কম নিয়ে ধরে রাখা তিন মাস শূন্য ঘরের চেয়ে ভালো।

## ভাড়াটে অস্বীকার করলে কী করবেন

যদি সম্মত না হন: আনুষ্ঠানিক লিখিত নোটিশ দিন, সব যোগাযোগ নথিভুক্ত করুন, ইউটিলিটি বন্ধ করবেন না। প্রয়োজনে স্থানীয় ভাড়া নিয়ন্ত্রক বা দেওয়ানি আদালতে যান। পেশাদার প্রক্রিয়া — লিখিত নোটিশ, ন্যায্য পরিমাণ, স্পষ্ট সময়সীমা — ৯০% ক্ষেত্রে দ্বন্দ্ব ছাড়াই সমাধান দেয়।`,
    },
  },
  {
    slug: 'digital-vs-manual-caretaker-accounts',
    date: '2026-04-08',
    readingTime: 6,
    author: { en: 'BariShamlai', bn: 'বাড়ি সামলাই' },
    category: { en: 'Building Management', bn: 'ভবন ব্যবস্থাপনা' },
    coverImage: '/blog/sc-meeting.jpg',
    coverAlt: 'Caretaker reviewing building accounts on a tablet',
    title: {
      en: 'Ditching the Paper Diary: Securing Caretaker Accounts Digitally',
      bn: 'কাগজের খাতা বাদ দিন: কেয়ারটেকারের হিসাব ডিজিটালে সুরক্ষিত করুন',
    },
    excerpt: {
      en: 'The paper diary your caretaker uses for accounts is a liability — it can be lost, altered, or destroyed. Digital caretaker accounts are transparent, auditable, and dispute-proof.',
      bn: 'কেয়ারটেকারের কাগজের হিসাবের খাতা একটি ঝুঁকি — হারিয়ে যেতে পারে, পরিবর্তন হতে পারে বা নষ্ট হতে পারে। ডিজিটাল কেয়ারটেকার অ্যাকাউন্ট স্বচ্ছ, নিরীক্ষাযোগ্য এবং বিরোধমুক্ত।',
    },
    content: {
      en: `> In thousands of Dhaka apartment buildings, the entire financial record of a building passes through a single notebook in the caretaker's room. When the caretaker leaves, so does institutional memory. When the notebook gets wet, the history is gone.

## The Real Cost of Manual Caretaker Records

![Building caretaker at a reception desk](/blog/sc-building.jpg)

Manual records create three systemic problems that most building owners only discover during a dispute:

**1. No verification trail.** A paper entry can be written, changed, or backdated. Without a timestamp from an independent system, it is one person's word against another.

**2. Knowledge concentrated in one person.** When a caretaker leaves — whether by resignation or dismissal — the institutional memory of the building goes with them. New caretakers inherit confusion, not clarity.

**3. No real-time oversight.** A landlord living in a different neighbourhood or abroad has no way to verify what was collected today unless they physically visit or call the caretaker.

## What Digital Caretaker Accounts Provide

| Feature | Paper diary | Digital (Bari Shamlai) |
|---------|-------------|------------------------|
| Timestamped entries | ✗ | ✓ |
| Owner can see in real-time | ✗ | ✓ |
| Automatic monthly totals | ✗ | ✓ |
| Receipt generated per payment | ✗ | ✓ |
| Survives caretaker departure | ✗ | ✓ |
| Exportable for tax purposes | ✗ | ✓ |

## Transitioning Your Caretaker to Digital

The biggest resistance to change is the caretaker's own comfort with paper. Address this by:

**Starting with collection recording only.** Don't ask the caretaker to do everything digitally on day one. Begin by having them log each rent collection in the app. Nothing else changes.

**Using a phone, not a computer.** Caretakers in Bangladesh almost universally own smartphones. A mobile-first app removes the technology barrier entirely.

**Showing the caretaker the benefit.** A digital record protects the caretaker too — if a tenant disputes a payment, the caretaker has a timestamped record that proves the collection happened. Frame it as protection, not surveillance.

**Reviewing the first month together.** Sit with your caretaker after the first month and review the digital records together. This builds their confidence and catches any gaps in the process.

## Handling Petty Cash and Expenses

Beyond rent collection, caretakers typically manage petty cash for minor building expenses: light bulbs, cleaning supplies, minor repairs. This is the area most prone to leakage — not necessarily dishonesty, but simply inconsistent tracking.

Set a fixed monthly petty cash limit (e.g., ৳3,000) and require that every expense be logged with a category. At month-end, the caretaker presents receipts for what was spent. Any unspent amount rolls over or is returned. This simple system eliminates ambiguity and protects honest caretakers from being falsely accused.

The shift from paper to digital does not require a new caretaker — it requires a new process. Start small, review consistently, and the transition usually takes less than 60 days to become routine.`,
      bn: `> ঢাকার হাজার হাজার অ্যাপার্টমেন্ট ভবনে, একটি ভবনের পুরো আর্থিক রেকর্ড কেয়ারটেকারের ঘরের একটি নোটবুকে থাকে। কেয়ারটেকার চলে গেলে প্রাতিষ্ঠানিক স্মৃতিও চলে যায়।

## ম্যানুয়াল কেয়ারটেকার রেকর্ডের আসল খরচ

ম্যানুয়াল রেকর্ড তিনটি সমস্যা তৈরি করে:

**১. কোনো যাচাইয়ের ট্রেইল নেই।** কাগজের এন্ট্রি লেখা, পরিবর্তন বা পূর্ববর্তী তারিখে করা যায়। স্বাধীন সিস্টেমের টাইমস্ট্যাম্প ছাড়া এটি একজনের কথার বিরুদ্ধে আরেকজনের কথা।

**২. জ্ঞান এক ব্যক্তির মধ্যে কেন্দ্রীভূত।** কেয়ারটেকার চলে গেলে ভবনের প্রাতিষ্ঠানিক স্মৃতি তার সাথে চলে যায়।

**৩. রিয়েল-টাইম তদারকি নেই।** অন্য এলাকায় বা বিদেশে থাকা বাড়িওয়ালা যাচাই করতে পারেন না আজকে কী সংগ্রহ হয়েছে।

## ডিজিটাল কেয়ারটেকার অ্যাকাউন্ট কী দেয়

| ফিচার | কাগজের খাতা | ডিজিটাল (বাড়ি সামলাই) |
|-------|------------|----------------------|
| টাইমস্ট্যাম্পযুক্ত এন্ট্রি | ✗ | ✓ |
| মালিক রিয়েল-টাইমে দেখতে পারেন | ✗ | ✓ |
| স্বয়ংক্রিয় মাসিক মোট | ✗ | ✓ |
| প্রতি পেমেন্টে রসিদ | ✗ | ✓ |
| কেয়ারটেকার চলে গেলেও টিকে | ✗ | ✓ |

## কেয়ারটেকারকে ডিজিটালে নিয়ে যাওয়া

**শুধু সংগ্রহ রেকর্ডিং দিয়ে শুরু করুন।** প্রথম দিনেই সব কিছু ডিজিটাল করতে বলবেন না। শুধু প্রতিটি ভাড়া সংগ্রহ অ্যাপে লগ করতে বলুন।

**কম্পিউটার নয়, ফোন ব্যবহার করুন।** বাংলাদেশের কেয়ারটেকাররা প্রায় সার্বজনীনভাবে স্মার্টফোন ব্যবহার করেন। মোবাইল-ফার্স্ট অ্যাপ প্রযুক্তির বাধা দূর করে।

**কেয়ারটেকারকে সুবিধা দেখান।** ডিজিটাল রেকর্ড কেয়ারটেকারকেও রক্ষা করে — কোনো ভাড়াটে পেমেন্ট নিয়ে বিতর্ক করলে, টাইমস্ট্যাম্প রেকর্ড প্রমাণ করে সংগ্রহ হয়েছে।

**প্রথম মাস একসাথে পর্যালোচনা করুন।** প্রথম মাসের পরে কেয়ারটেকারের সাথে বসে ডিজিটাল রেকর্ড যাচাই করুন। এটি তার আত্মবিশ্বাস বাড়ায়।

## পেটি ক্যাশ পরিচালনা

একটি নির্দিষ্ট মাসিক পেটি ক্যাশ সীমা নির্ধারণ করুন (যেমন ৩,০০০ টাকা) এবং প্রতিটি ব্যয় ক্যাটাগরি সহ লগ করতে বলুন। মাস শেষে কেয়ারটেকার রসিদ উপস্থাপন করবেন। এই সহজ সিস্টেম অস্পষ্টতা দূর করে এবং সৎ কেয়ারটেকারদের মিথ্যা অভিযোগ থেকে রক্ষা করে।`,
    },
  },
  {
    slug: 'dncc-compliance-checklist-landlords-dhaka',
    date: '2026-04-10',
    readingTime: 8,
    author: { en: 'BariShamlai', bn: 'বাড়ি সামলাই' },
    category: { en: 'Compliance', bn: 'আইনি সম্মতি' },
    coverImage: '/blog/buildings-cover.jpg',
    coverAlt: 'Residential apartment buildings in Dhaka',
    title: {
      en: 'The Ultimate DNCC Compliance Guide for Dhaka Landlords',
      bn: 'ঢাকার বাড়িওয়ালাদের জন্য DNCC সম্মতির সম্পূর্ণ গাইড',
    },
    excerpt: {
      en: 'DNCC fines and notices are increasingly common. This comprehensive checklist covers every compliance requirement for residential buildings in Dhaka North, from holding taxes to rooftop rules.',
      bn: 'DNCC জরিমানা ও নোটিশ ক্রমশ বাড়ছে। এই বিস্তারিত চেকলিস্টে ঢাকা উত্তরের আবাসিক ভবনের প্রতিটি সম্মতির প্রয়োজনীয়তা — হোল্ডিং ট্যাক্স থেকে ছাদের নিয়ম পর্যন্ত — আলোচনা করা হয়েছে।',
    },
    content: {
      en: `> DNCC (Dhaka North City Corporation) has significantly stepped up inspections and penalty enforcement in the last two years. Landlords who were accustomed to ignoring notices are now facing fines of ৳50,000 to several lakh taka for persistent non-compliance.

## Why Compliance Matters More Than Ever

![Residential apartment buildings in Dhaka](/blog/sc-city.jpg)

Three changes have made DNCC compliance non-negotiable:

1. **Digital records.** DNCC now cross-references property tax payments against building permits. Properties with discrepancies get flagged automatically.
2. **Mobile inspection teams.** Spot-check teams now operate across all wards without prior notice.
3. **Holding tax arrears attract interest.** Unpaid holding tax accrues 2% monthly interest, compounding what started as a minor shortfall into a major liability.

## The Complete DNCC Compliance Checklist

### 1. Holding Tax (হোল্ডিং ট্যাক্স)

- [ ] Annual holding tax assessment completed and current
- [ ] Tax paid by the due date each year (typically March–June)
- [ ] Assessment reflects current building usage (residential/commercial/mixed)
- [ ] No arrears from prior years — check your holding number history

**Action if behind:** Visit your ward's DNCC office with your holding number. Arrears can be paid with accrued interest. A payment plan may be possible for large amounts.

### 2. Building Permit and Plan Compliance

- [ ] Original building permit from RAJUK on file
- [ ] Building constructed as per approved plan (no unauthorized extensions on rooftop or ground floor)
- [ ] Any modifications post-construction have been approved or are being regularized

### 3. Utility Connections

- [ ] WASA water connection in building owner's name (not an informal tap)
- [ ] DESCO/DPDC electricity connection with valid commercial or residential tariff
- [ ] Gas connection (if applicable) registered with Titas Gas

### 4. Waste and Sanitation

- [ ] Designated dustbin/waste collection point identified
- [ ] Waste disposed through DNCC-registered waste collector (not dumped on street or drain)
- [ ] Drainage system connected to municipal drain, not open road drain or khaal

### 5. Signage and Building Number

- [ ] Building number plate visible from street
- [ ] Building owner's name visible on main gate (required for residential buildings above 4 storeys in many wards)

### 6. Rooftop and Common Area

- [ ] No permanent construction on rooftop beyond approved staircase/lift machine room
- [ ] Water tank properly covered (mosquito breeding prevention)
- [ ] Fire safety compliance: at least one ABC-type fire extinguisher per floor for buildings above 4 storeys

### 7. Trade License (if applicable)

- [ ] If any commercial unit in the building, trade license current for that tenant
- [ ] Commercial units using correct electricity tariff (commercial, not residential)

## Annual Compliance Calendar

| Month | Action Required |
|-------|----------------|
| January | Review holding tax assessment for upcoming year |
| February–March | Pay holding tax before deadline |
| April | Fire extinguisher inspection and servicing |
| June | WASA bill audit — ensure no irregular connections |
| October | Rooftop inspection before monsoon damage claims |
| December | Annual caretaker training on waste disposal rules |

Maintaining a simple compliance file — with holding tax receipts, permits, and utility connection papers — transforms a potentially stressful inspection into a routine conversation. Start building yours today.`,
      bn: `> DNCC (ঢাকা উত্তর সিটি কর্পোরেশন) গত দুই বছরে পরিদর্শন ও জরিমানা উল্লেখযোগ্যভাবে বাড়িয়েছে। যেসব বাড়িওয়ালা নোটিশ উপেক্ষা করতেন, তারা এখন ৫০,০০০ থেকে কয়েক লাখ টাকা জরিমানার মুখে পড়ছেন।

## কেন সম্মতি এখন আরও জরুরি

তিনটি পরিবর্তন DNCC সম্মতিকে অপরিহার্য করে তুলেছে:

১. **ডিজিটাল রেকর্ড।** DNCC এখন সম্পত্তি কর পেমেন্ট বিল্ডিং পারমিটের বিপরীতে যাচাই করে। অমিল থাকলে স্বয়ংক্রিয়ভাবে চিহ্নিত হয়।
২. **মোবাইল পরিদর্শন দল।** স্পট-চেক দল এখন পূর্ব নোটিশ ছাড়াই সব ওয়ার্ডে কাজ করে।
৩. **হোল্ডিং ট্যাক্স বকেয়ায় সুদ।** অপরিশোধিত হোল্ডিং ট্যাক্সে মাসে ২% সুদ জমা হয়।

## সম্পূর্ণ DNCC সম্মতি চেকলিস্ট

### ১. হোল্ডিং ট্যাক্স

- [ ] বার্ষিক হোল্ডিং ট্যাক্স মূল্যায়ন সম্পন্ন এবং হালনাগাদ
- [ ] প্রতি বছর নির্ধারিত সময়ে কর পরিশোধ
- [ ] মূল্যায়ন বর্তমান ব্যবহার প্রতিফলিত করে
- [ ] আগের বছরের কোনো বকেয়া নেই

### ২. বিল্ডিং পারমিট এবং প্ল্যান সম্মতি

- [ ] RAJUK-এর মূল বিল্ডিং পারমিট ফাইলে আছে
- [ ] অনুমোদিত প্ল্যান অনুযায়ী নির্মিত (ছাদে বা গ্রাউন্ড ফ্লোরে অননুমোদিত সম্প্রসারণ নেই)

### ৩. ইউটিলিটি সংযোগ

- [ ] বাড়িওয়ালার নামে WASA পানি সংযোগ
- [ ] বৈধ DESCO/DPDC বিদ্যুৎ সংযোগ
- [ ] প্রযোজ্য হলে Titas Gas নিবন্ধিত

### ৪. বর্জ্য ও স্যানিটেশন

- [ ] নির্ধারিত ডাস্টবিন/বর্জ্য সংগ্রহ পয়েন্ট
- [ ] DNCC-নিবন্ধিত বর্জ্য সংগ্রাহকের মাধ্যমে বর্জ্য নিষ্পত্তি
- [ ] ড্রেনেজ সিস্টেম মিউনিসিপাল ড্রেনে সংযুক্ত

### ৫. ছাদ ও সাধারণ এলাকা

- [ ] ছাদে অনুমোদিত সিঁড়ি/লিফট মেশিন রুমের বাইরে স্থায়ী নির্মাণ নেই
- [ ] ওয়াটার ট্যাংক সঠিকভাবে ঢাকা
- [ ] ৪ তলার বেশি ভবনে প্রতি তলায় ন্যূনতম একটি আগুন নেভানোর যন্ত্র

## বার্ষিক সম্মতি ক্যালেন্ডার

| মাস | প্রয়োজনীয় পদক্ষেপ |
|-----|-------------------|
| জানুয়ারি | আগামী বছরের হোল্ডিং ট্যাক্স মূল্যায়ন যাচাই |
| ফেব্রুয়ারি-মার্চ | নির্ধারিত সময়ের আগে হোল্ডিং ট্যাক্স পরিশোধ |
| এপ্রিল | আগুন নেভানোর যন্ত্র পরিদর্শন ও সার্ভিসিং |
| জুন | WASA বিল অডিট |
| অক্টোবর | বর্ষার আগে ছাদ পরিদর্শন |

হোল্ডিং ট্যাক্স রসিদ, পারমিট এবং ইউটিলিটি কানেকশন কাগজ সহ একটি সহজ সম্মতি ফাইল রাখা — একটি সম্ভাব্য চাপের পরিদর্শনকে রুটিন কথোপকথনে পরিণত করে।`,
    },
  },
  {
    slug: 'green-rooftop-initiative-dhaka-apartments',
    date: '2026-04-12',
    readingTime: 6,
    author: { en: 'BariShamlai', bn: 'বাড়ি সামলাই' },
    category: { en: 'Sustainability', bn: 'টেকসই উন্নয়ন' },
    coverImage: '/blog/sc-city.jpg',
    coverAlt: 'Dhaka city skyline with residential rooftops',
    title: {
      en: 'Rooftop Gardens & the DNCC 10% Tax Rebate: What Landlords Need to Know',
      bn: 'ছাদবাগান ও DNCC-র ১০% ট্যাক্স ছাড়: বাড়িওয়ালাদের যা জানা দরকার',
    },
    excerpt: {
      en: 'DNCC offers a 10% holding tax rebate for buildings with qualifying rooftop gardens. The application is simpler than most landlords assume — and the environmental and social benefits stack up beyond the rebate.',
      bn: 'DNCC যোগ্যতাসম্পন্ন ছাদবাগানের জন্য ১০% হোল্ডিং ট্যাক্স ছাড় দেয়। আবেদন প্রক্রিয়া বেশিরভাগ বাড়িওয়ালার ধারণার চেয়ে সহজ — এবং পরিবেশগত ও সামাজিক সুবিধাগুলো ছাড়ের বাইরেও অনেক।',
    },
    content: {
      en: `> Dhaka is one of Asia's most densely built cities. Concrete covers almost every surface. DNCC's rooftop garden initiative is a rare incentive that rewards landlords financially for adding green space — while tackling urban heat and air quality.

## The DNCC Rooftop Garden Tax Rebate

![Apartment buildings in Dhaka with potential rooftop spaces](/blog/buildings-inline.jpg)

DNCC introduced the rooftop garden tax incentive as part of its urban greening programme. The rebate is:

- **10% reduction on annual holding tax** for buildings with a qualifying rooftop garden
- Available to both residential and mixed-use buildings
- Requires annual reconfirmation (inspection or self-declaration, depending on ward)

For a building paying ৳30,000/year in holding tax, this is ৳3,000 saved annually — without any change in the building's income.

## What Qualifies as a "Rooftop Garden"?

DNCC does not require a manicured botanical garden. The minimum qualification criteria (which may vary slightly by ward) typically include:

| Requirement | Details |
|-------------|---------|
| Coverage | At least 20% of rooftop area must have living plants |
| Container depth | Minimum 6 inches of soil/growing medium |
| Species | Any food crops, ornamental plants, or trees — at least 10 distinct containers or raised beds |
| Irrigation | Regular watering evidence (functional drip system or visible watering cans/hose) |
| No structure | No new permanent structures built under the guise of a garden |

Grow bags with tomatoes, chilies, or bottle gourds count. Potted plants along the parapet count. Even a simple herb garden in recycled containers qualifies.

## Beyond the Rebate: Real Benefits

**Heat reduction.** Rooftop greenery reduces surface temperatures by 5–10°C, directly lowering cooling costs for the top floor flat. Tenants notice.

**Tenant attraction.** A rooftop garden is a meaningful selling point — particularly for families. In a market where many buildings are identical, it creates differentiation.

**Community building.** Buildings where tenants share a rooftop garden report stronger social cohesion and fewer disputes over common areas.

**Air quality.** Each square metre of green space absorbs particulates. In Dhaka's air-quality context, this is a genuine benefit for residents.

## How to Apply for the Rebate

1. **Create the garden first.** Minimum qualifying standard before applying.
2. **Visit your ward DNCC office** with your holding number and photos of the rooftop garden.
3. **Complete the application form** (available at the ward office or the DNCC website).
4. **Schedule an inspection** — a ward inspector will visit within 2–4 weeks.
5. **Receive certification** — the rebate is applied to your next holding tax bill.

The entire process takes 4–8 weeks in most wards. Some wards allow photo-based self-declaration for buildings that have already been inspected in a prior year.

Start with ten grow bags on your rooftop this weekend. The investment is under ৳2,000. The rebate and tenant goodwill pay back that investment many times over.`,
      bn: `> ঢাকা এশিয়ার সবচেয়ে ঘনবসতিপূর্ণ শহরগুলির একটি। কংক্রিট প্রায় প্রতিটি পৃষ্ঠ ঢেকে রেখেছে। DNCC-র ছাদবাগান উদ্যোগ বাড়িওয়ালাদের সবুজ স্থান যোগ করার জন্য আর্থিকভাবে পুরস্কৃত করে।

## DNCC ছাদবাগান ট্যাক্স ছাড়

DNCC তার নগর সবুজায়ন কর্মসূচির অংশ হিসেবে ছাদবাগান ট্যাক্স প্রণোদনা চালু করেছে:

- যোগ্য ছাদবাগানযুক্ত ভবনের জন্য **বার্ষিক হোল্ডিং ট্যাক্সে ১০% ছাড়**
- আবাসিক ও মিশ্র-ব্যবহারের ভবন উভয়ের জন্য প্রযোজ্য
- বার্ষিক পুনর্নিশ্চিতকরণ প্রয়োজন

৩০,০০০ টাকা বার্ষিক হোল্ডিং ট্যাক্স দেওয়া একটি ভবনের জন্য এটি প্রতি বছর ৩,০০০ টাকা সাশ্রয়।

## "ছাদবাগান" হিসেবে কী যোগ্য?

| প্রয়োজনীয়তা | বিবরণ |
|--------------|-------|
| কভারেজ | ছাদের কমপক্ষে ২০% এলাকায় জীবন্ত গাছ থাকতে হবে |
| পাত্রের গভীরতা | ন্যূনতম ৬ ইঞ্চি মাটি/গ্রোয়িং মিডিয়াম |
| প্রজাতি | যেকোনো খাদ্যশস্য, শোভাবর্ধনকারী গাছ বা গাছ — কমপক্ষে ১০টি পাত্র |

টমেটো, মরিচ বা লাউ সহ গ্রো ব্যাগ গণনা করা হয়। প্যারাপেট বরাবর পটেড গাছ গণনা করা হয়।

## ছাড়ের বাইরে সুবিধা

**তাপ হ্রাস।** ছাদের সবুজ পৃষ্ঠের তাপমাত্রা ৫-১০°C কমায়, সরাসরি উপরের তলার ঠান্ডা করার খরচ কমায়।

**ভাড়াটে আকর্ষণ।** ছাদবাগান একটি অর্থবহ বিক্রয় পয়েন্ট — বিশেষত পরিবারগুলির জন্য।

**সম্প্রদায় গঠন।** ছাদবাগান ভাগ করে নেওয়া ভবনগুলিতে আরও শক্তিশালী সামাজিক সংহতি দেখা যায়।

## ছাড়ের জন্য কীভাবে আবেদন করবেন

১. **আগে বাগান তৈরি করুন।** আবেদনের আগে ন্যূনতম যোগ্যতার মান পূরণ করুন।
২. **আপনার হোল্ডিং নম্বর ও ছাদবাগানের ছবি নিয়ে ওয়ার্ড DNCC অফিসে যান।**
৩. **আবেদন ফর্ম পূরণ করুন।**
৪. **পরিদর্শনের সময়সূচি নির্ধারণ করুন** — একজন ওয়ার্ড পরিদর্শক ২-৪ সপ্তাহের মধ্যে আসবেন।
৫. **সনদ পান** — পরবর্তী হোল্ডিং ট্যাক্স বিলে ছাড় প্রয়োগ হবে।

এই সপ্তাহান্তে আপনার ছাদে দশটি গ্রো ব্যাগ দিয়ে শুরু করুন। বিনিয়োগ ২,০০০ টাকার কম। ছাড় এবং ভাড়াটেদের সুমনোভাব সেই বিনিয়োগ বহুগুণে ফিরিয়ে দেয়।`,
    },
  },
  {
    slug: 'legally-handling-defaulting-tenants-bd',
    date: '2026-04-14',
    readingTime: 9,
    author: { en: 'BariShamlai', bn: 'বাড়ি সামলাই' },
    category: { en: 'Legal', bn: 'আইনি বিষয়' },
    coverImage: '/blog/rent-cover.jpg',
    coverAlt: 'Formal eviction notice and legal documents',
    title: {
      en: 'The Legal Blueprint for Handling Defaulting Tenants in Bangladesh',
      bn: 'বাংলাদেশে খেলাপি ভাড়াটে সামলানোর আইনি নির্দেশিকা',
    },
    excerpt: {
      en: 'A tenant stops paying. Emotions run high. But taking the wrong step — cutting utilities, changing locks — exposes you to legal liability. Here is the step-by-step legal process for landlords in Bangladesh.',
      bn: 'ভাড়াটে পেমেন্ট বন্ধ করে দিয়েছেন। আবেগ তীব্র হয়। কিন্তু ভুল পদক্ষেপ — ইউটিলিটি বন্ধ করা, তালা পরিবর্তন — আপনাকে আইনি দায়ে ফেলতে পারে। এখানে বাংলাদেশের বাড়িওয়ালাদের জন্য ধাপে ধাপে আইনি প্রক্রিয়া আলোচনা করা হয়েছে।',
    },
    content: {
      en: `> The moment a tenant stops paying rent, most landlords face a dilemma: wait patiently (and lose income) or act firmly (and risk doing something illegal). The right path is a documented, escalating process that protects your legal position at every step.

## What You Must NOT Do

Before covering the legal path, let's be clear about actions that landlords take that expose them to criminal liability in Bangladesh:

- **Cutting electricity, water, or gas supply** to a tenant who has not vacated — this is illegal even if rent is unpaid
- **Changing or removing locks** before a court order is obtained
- **Removing the tenant's belongings** from the premises
- **Threatening or intimidating** the tenant or their family

These actions can result in a criminal complaint being filed against you, regardless of how much rent the tenant owes. Courts will not be sympathetic to a landlord who took the law into their own hands.

## The 5-Stage Legal Escalation Process

### Stage 1: Informal Resolution (Days 1–14)

When rent is late, start with a direct conversation. Many late payments are temporary cash flow issues that resolve quickly. Document this conversation with a note in your records.

If not resolved in 7 days, send a **formal payment reminder** in writing (text message or written note). Keep a copy or screenshot. Record the date in Bari Shamlai.

### Stage 2: Written Legal Notice (Day 15–30)

If payment is still outstanding after 14 days:

- Issue a **formal written notice** stating:
  - The amount owed
  - A deadline to pay (typically 7 days)
  - A statement that failure to pay will result in legal proceedings
- Deliver in person with a witness, or by registered post
- Keep a copy and your postal receipt

This notice is a legal prerequisite in most proceedings. Without it, a court may dismiss your case on procedural grounds.

### Stage 3: Application to Rent Controller (Day 30–60)

Bangladesh's Premises Rent Control Act provides for a **Rent Controller** in each district. The process:

1. File an application at the Rent Controller's office in your district with:
   - Copy of the rental agreement
   - Copies of your payment notices
   - Documentation of unpaid rent
2. The Rent Controller issues notice to the tenant
3. A hearing is scheduled (typically within 30–60 days)
4. If the tenant fails to appear, or if you succeed on merits, an eviction order is issued

**Cost:** Filing fees are relatively low — typically ৳500–৳2,000 depending on the claim amount.

### Stage 4: Civil Court — Arrears Recovery (Parallel Track)

Separately from the eviction proceeding, you can file a **money recovery suit** in the civil court to recover unpaid rent as a debt. This is useful even after the tenant has vacated, to recover arrears.

### Stage 5: Execution of Court Order

Once you have an eviction order, if the tenant still does not leave:
- Apply to the court for a **warrant of possession**
- Court bailiffs execute the order, with police assistance if needed
- At this stage, the tenant's belongings may be removed under official supervision

## How Long Does This Take?

Realistically, the full process — from first missed payment to court-ordered eviction — takes **3–9 months** in Dhaka courts, depending on the ward and court backlog. Starting the process early (issuing the formal notice at day 15) compresses this timeline as much as possible.

## The Most Important Thing: Documentation

From day one of a tenancy, maintain records in Bari Shamlai:
- Signed rental agreement
- Every payment received with date and method
- Every notice sent with delivery confirmation

A landlord with clean records wins disputes. A landlord with no records starts every dispute at a disadvantage. Begin your documentation habit today, before a problem arises.`,
      bn: `> যখন একজন ভাড়াটে ভাড়া দেওয়া বন্ধ করেন, বেশিরভাগ বাড়িওয়ালা দ্বিধায় পড়েন: ধৈর্যের সাথে অপেক্ষা করবেন (এবং আয় হারাবেন) নাকি দৃঢ়ভাবে কাজ করবেন (এবং বেআইনি কিছু করার ঝুঁকি নেবেন)।

## কী করা যাবে না

আইনি দায় সৃষ্টিকারী পদক্ষেপ:

- ভাড়া অপরিশোধিত থাকলেও যে ভাড়াটে চলে যাননি তার **বিদ্যুৎ, পানি বা গ্যাস সরবরাহ বন্ধ করা** — এটি বেআইনি
- আদালতের আদেশ পাওয়ার আগে **তালা পরিবর্তন বা খোলা**
- প্রাঙ্গণ থেকে ভাড়াটের জিনিসপত্র **সরিয়ে নেওয়া**

এই পদক্ষেপগুলি আপনার বিরুদ্ধে ফৌজদারি অভিযোগ দায়ের করতে পারে, ভাড়াটে কতটাকা বকেয়া থাকুক না কেন।

## ৫-পর্যায়ের আইনি এস্কেলেশন প্রক্রিয়া

### পর্যায় ১: অনানুষ্ঠানিক সমাধান (১-১৪ দিন)

সরাসরি কথোপকথন দিয়ে শুরু করুন। অনেক দেরিতে পেমেন্ট অস্থায়ী নগদ প্রবাহের সমস্যা যা দ্রুত সমাধান হয়। ৭ দিনে সমাধান না হলে লিখিত **আনুষ্ঠানিক পেমেন্ট অনুস্মারক** পাঠান।

### পর্যায় ২: লিখিত আইনি নোটিশ (১৫-৩০ দিন)

**আনুষ্ঠানিক লিখিত নোটিশ** জারি করুন যাতে উল্লেখ থাকবে:
- বকেয়া পরিমাণ
- পেমেন্টের সময়সীমা (সাধারণত ৭ দিন)
- আইনি কার্যক্রমের সতর্কতা

সাক্ষীর উপস্থিতিতে সরাসরি বা নিবন্ধিত ডাকে পৌঁছান। একটি কপি এবং ডাক রসিদ রাখুন।

### পর্যায় ৩: ভাড়া নিয়ন্ত্রকের কাছে আবেদন (৩০-৬০ দিন)

প্রতিটি জেলায় বাংলাদেশের প্রিমিসেস রেন্ট কন্ট্রোল আইনে একজন **ভাড়া নিয়ন্ত্রক** আছেন। আবেদনে থাকবে:
- ভাড়া চুক্তির কপি
- পেমেন্ট নোটিশের কপি
- অপরিশোধিত ভাড়ার নথি

### পর্যায় ৪: দেওয়ানি আদালত — বকেয়া আদায় (সমান্তরাল ট্র্যাক)

উচ্ছেদ কার্যক্রমের পাশাপাশি, দেওয়ানি আদালতে **অর্থ আদায় মামলা** দায়ের করুন।

### পর্যায় ৫: আদালতের আদেশ কার্যকর করা

উচ্ছেদের আদেশ পেলে, ভাড়াটে না গেলে **দখলের পরোয়ানা** চান। আদালতের বেলিফ প্রয়োজনে পুলিশের সহায়তায় আদেশ কার্যকর করবেন।

## সবচেয়ে গুরুত্বপূর্ণ বিষয়: নথিপত্র

বাড়ি সামলাইতে রাখুন: স্বাক্ষরিত ভাড়া চুক্তি, তারিখ ও পদ্ধতিসহ প্রতিটি পেমেন্ট, ডেলিভারি নিশ্চিতকরণ সহ প্রতিটি নোটিশ। পরিষ্কার রেকর্ডধারী বাড়িওয়ালা বিরোধ জেতেন।`,
    },
  },
  {
    slug: 'nrb-property-management-from-abroad',
    date: '2026-04-16',
    readingTime: 7,
    author: { en: 'BariShamlai', bn: 'বাড়ি সামলাই' },
    category: { en: 'NRB Landlords', bn: 'প্রবাসী বাড়িওয়ালা' },
    coverImage: '/blog/buildings-cover.jpg',
    coverAlt: 'Residential buildings in Dhaka managed remotely',
    title: {
      en: 'The Expatriate\'s Guide to Managing Dhaka Properties from Abroad',
      bn: 'প্রবাস থেকে ঢাকার সম্পত্তি পরিচালনার সম্পূর্ণ গাইড',
    },
    excerpt: {
      en: 'Managing a building from the UK, US, or the Gulf is harder than it sounds — but it\'s also more achievable than most NRBs believe. The right systems remove the need to be physically present for 90% of decisions.',
      bn: 'যুক্তরাজ্য, যুক্তরাষ্ট্র বা উপসাগরীয় দেশ থেকে ভবন পরিচালনা শুনতে যতটা কঠিন মনে হয় — বেশিরভাগ প্রবাসীর ধারণার চেয়ে এটি আসলে অনেক বেশি সম্ভব। সঠিক সিস্টেম ৯০% সিদ্ধান্তে শারীরিক উপস্থিতির প্রয়োজনীয়তা দূর করে।',
    },
    content: {
      en: `> There are an estimated 1.3 million Bangladeshi property owners living outside Bangladesh. Most rely on a relative or an informal caretaker to manage their assets. Most are losing money — to dishonesty, negligence, or simply poor processes — without knowing it.

## The Three Core Problems of Remote Management

![Aerial view of Dhaka residential buildings](/blog/buildings-inline.jpg)

**1. No visibility.** Without real-time data, an NRB landlord has no way to know which tenants paid, which did not, what the caretaker spent, or whether the building is properly maintained — until a crisis occurs.

**2. Dependence on one person.** When the trusted relative or caretaker becomes unavailable (illness, travel, conflict), the building management collapses. There is no system — only a person.

**3. No documentation for legal or financial purposes.** When an NRB returns to Bangladesh and wants to sell or mortgage a property, they often find that no proper tenancy records, tax receipts, or maintenance logs exist.

## Building a Remote-Management System

### Tier 1: The On-Ground Person

Every remotely managed building needs one reliable person on the ground. This is typically a building caretaker or a trusted relative. Their responsibilities should be clearly defined in writing:

- Daily: unlock/lock common areas, basic cleaning oversight
- Weekly: collect any cash payments, report issues via the app
- Monthly: review accounts with the NRB landlord on a video call

Avoid making one person responsible for both maintenance and rent collection — separation of duties reduces temptation and errors.

### Tier 2: Digital Infrastructure

This is where Bari Shamlai changes everything for NRB landlords:

| Function | What You Can Do Remotely |
|----------|-------------------------|
| Rent tracking | See who paid, who is late, and by how much — in real-time |
| Expense recording | Caretaker logs every expense; you review and approve |
| Receipts | Issue PDF receipts for every payment from your phone abroad |
| Tenant records | Access tenancy agreements, contact details, move-in dates |
| Payment reminders | Automated reminders sent to tenants before the due date |

No more calling home every month asking "did everyone pay?"

### Tier 3: A Quarterly Return Visit (or Proxy Visit)

Even with perfect digital systems, a physical visit every 3–6 months is valuable. If you cannot travel, arrange for a trusted representative to:

- Physically inspect the building
- Review any maintenance work completed
- Meet with tenants briefly to address concerns
- Verify that the caretaker's records match what's in the app

### Financial Considerations for NRBs

**Sending maintenance money home.** Use bKash or formal bank remittance for all maintenance expenses — these create a paper trail for tax purposes in Bangladesh.

**Tax on rental income.** NRBs are subject to income tax on rental income earned in Bangladesh. Maintain records of income and allowable deductions (maintenance, depreciation) to ensure you are paying correctly and not over-paying.

**Power of Attorney.** For routine property matters, a General Power of Attorney to a trusted relative allows them to sign documents, deal with authorities, and manage day-to-day affairs in your absence. Register this with a notary before you leave.

## What to Do Right Now

If you are an NRB landlord who does not currently have a digital management system:

1. Ask your caretaker or trusted relative to create a Bari Shamlai account for your building
2. Enter all current tenants and their payment status
3. Set up automated payment reminders for the next due date
4. Schedule a monthly 30-minute video call to review accounts together

The goal is not perfection on day one. The goal is visibility — and that starts with a single login.`,
      bn: `> আনুমানিক ১৩ লাখ বাংলাদেশি সম্পত্তির মালিক বাংলাদেশের বাইরে বাস করেন। বেশিরভাগ একজন আত্মীয় বা অনানুষ্ঠানিক কেয়ারটেকারের উপর নির্ভর করেন। বেশিরভাগই অর্থ হারাচ্ছেন — অসততা, অবহেলা বা দুর্বল প্রক্রিয়ার কারণে — না জেনেই।

## দূর থেকে ব্যবস্থাপনার তিনটি মূল সমস্যা

**১. কোনো দৃশ্যমানতা নেই।** রিয়েল-টাইম ডেটা ছাড়া, একজন প্রবাসী বাড়িওয়ালা জানতে পারেন না কোন ভাড়াটে দিয়েছেন, কোনটি দেননি, কেয়ারটেকার কী খরচ করেছেন।

**২. একজন ব্যক্তির উপর নির্ভরতা।** বিশ্বস্ত আত্মীয় বা কেয়ারটেকার অনুপলব্ধ হলে — ভবন ব্যবস্থাপনা ভেঙে পড়ে।

**৩. কোনো নথিপত্র নেই।** প্রবাসী ফিরে এলে দেখেন কোনো সঠিক ভাড়া রেকর্ড, ট্যাক্স রসিদ বা রক্ষণাবেক্ষণ লগ নেই।

## দূরবর্তী ব্যবস্থাপনা সিস্টেম তৈরি

### স্তর ১: মাঠ পর্যায়ের ব্যক্তি

প্রতিটি দূরবর্তীভাবে পরিচালিত ভবনে একজন নির্ভরযোগ্য ব্যক্তি দরকার। দায়িত্ব লিখিতভাবে নির্ধারণ করুন। রক্ষণাবেক্ষণ এবং ভাড়া সংগ্রহ আলাদা ব্যক্তিকে দিন।

### স্তর ২: ডিজিটাল অবকাঠামো

| ফাংশন | দূর থেকে যা করতে পারেন |
|-------|----------------------|
| ভাড়া ট্র্যাকিং | রিয়েল-টাইমে কে দিয়েছে, কে দেরিতে আছে দেখুন |
| খরচ রেকর্ডিং | কেয়ারটেকার লগ করে; আপনি যাচাই ও অনুমোদন করেন |
| রসিদ | বিদেশ থেকে ফোনে পিডিএফ রসিদ জারি করুন |
| স্বয়ংক্রিয় অনুস্মারক | ভাড়াটেদের নিয়মিত অনুস্মারক পাঠানো হয় |

### স্তর ৩: ত্রৈমাসিক পরিদর্শন

প্রতি ৩-৬ মাসে একটি ভৌত পরিদর্শন মূল্যবান। না পারলে, একজন বিশ্বস্ত প্রতিনিধি পাঠান।

## প্রবাসীদের আর্থিক বিষয়

**রক্ষণাবেক্ষণ অর্থ পাঠানো।** সমস্ত রক্ষণাবেক্ষণ খরচের জন্য বিকাশ বা আনুষ্ঠানিক ব্যাংক রেমিট্যান্স ব্যবহার করুন।

**ভাড়া আয়ের উপর ট্যাক্স।** প্রবাসীরা বাংলাদেশে অর্জিত ভাড়া আয়ের উপর আয়কর দিতে বাধ্য।

**পাওয়ার অব অ্যাটর্নি।** নিয়মিত সম্পত্তির বিষয়ে একজন বিশ্বস্ত আত্মীয়কে সাধারণ পাওয়ার অব অ্যাটর্নি দিন।

এখনই যা করবেন: কেয়ারটেকার বা বিশ্বস্ত আত্মীয়কে আপনার ভবনের জন্য বাড়ি সামলাই অ্যাকাউন্ট তৈরি করতে বলুন এবং মাসিক ৩০ মিনিটের ভিডিও কল নির্ধারণ করুন।`,
    },
  },
  {
    slug: 'police-verification-guide-tenants-dhaka',
    date: '2026-04-17',
    readingTime: 6,
    author: { en: 'BariShamlai', bn: 'বাড়ি সামলাই' },
    category: { en: 'Compliance', bn: 'আইনি সম্মতি' },
    coverImage: '/blog/sc-building.jpg',
    coverAlt: 'Apartment building entrance with security desk',
    title: {
      en: 'Mastering the DMP Tenant Registration Process Digitally',
      bn: 'DMP ভাড়াটে নিবন্ধন প্রক্রিয়া ডিজিটালে আয়ত্ত করুন',
    },
    excerpt: {
      en: 'Police verification of new tenants is a legal requirement in Dhaka under DMP regulations — yet most landlords skip it and risk fines. The process is now online and takes under 20 minutes.',
      bn: 'নতুন ভাড়াটেদের পুলিশ যাচাই DMP বিধিমালার অধীনে ঢাকায় আইনগত বাধ্যবাধকতা — তবুও বেশিরভাগ বাড়িওয়ালা এটি এড়িয়ে যান এবং জরিমানার ঝুঁকি নেন। প্রক্রিয়াটি এখন অনলাইনে এবং ২০ মিনিটের কম সময় নেয়।',
    },
    content: {
      en: `> DMP (Dhaka Metropolitan Police) requires landlords to register every new tenant within 15 days of move-in. The penalty for non-compliance is up to ৳50,000 and potential criminal liability under the Special Powers Act. Despite this, fewer than 20% of Dhaka landlords complete the process. It is now easier than ever — and the risks of skipping it have never been higher.

## Why Police Verification Matters

The DMP tenant registration requirement exists for security reasons: to maintain a database of who lives where, enabling police to trace persons of interest and respond to tenant-related security incidents.

From a landlord's perspective, the benefits go beyond legal compliance:
- **Verified identity.** The process confirms the tenant's NID, address history, and lack of outstanding warrants
- **Legal protection.** If a tenant commits a crime on or near your property, your completion of the verification process demonstrates good faith
- **Faster dispute resolution.** Verified tenants are easier to locate if they abscond without paying rent

## The Online DMP Tenant Registration Process

DMP has digitized the tenant registration process through its Police Clearance and Tenant Registration portal. Here is the step-by-step:

### Step 1: Gather Required Documents

Before logging in, have the following ready (scanned or photographed):

| Document | Who Provides It |
|----------|----------------|
| National ID (NID) of tenant | Tenant |
| Passport photo of tenant | Tenant |
| NID of all adult family members moving in | Tenant |
| Copy of signed rental agreement | Landlord |
| NID of building owner | Landlord |
| Trade license (if commercial) | Landlord |

### Step 2: Access the Portal

Visit the DMP citizen services portal. Select "Tenant Registration" (ভাড়াটিয়া নিবন্ধন). You will need your own NID number to create an account or log in.

### Step 3: Complete the Registration Form

The online form asks for:
- Building address and ward number
- Tenant's personal details (as per NID)
- Rental agreement date and duration
- Number of occupants
- Tenant's previous address (where they lived before)

Take your time completing this accurately — errors result in rejection and the need to resubmit.

### Step 4: Upload Documents

Upload the scanned/photographed documents. File size should be under 2MB each. JPG or PDF formats are accepted.

### Step 5: Submit and Track

After submission, you receive a tracking number. DMP processes the registration within 3–7 working days. You will receive an SMS when complete.

## Handling the Process for Multiple Units

If you have a multi-unit building with regular tenant turnover, create a standard document checklist that you give to every new tenant on signing day. Request the documents before the tenant moves in — not after. This eliminates the scramble to collect paperwork after move-in.

Bari Shamlai's tenant onboarding flow includes a document checklist that you can customise for DMP compliance requirements.

## What Happens If You Miss the 15-Day Window

If you miss the deadline:
1. Complete the registration immediately (late is better than never)
2. Note the reason for the delay in your records
3. If you have received a formal police notice, respond promptly in writing with proof that you have now submitted

Most wards do not proactively fine for first-time late submissions — they follow up with notices. Fines are more commonly issued for persistent non-compliance or following a security incident involving a tenant.`,
      bn: `> DMP (ঢাকা মেট্রোপলিটন পুলিশ) বাড়িওয়ালাদের প্রতিটি নতুন ভাড়াটে প্রবেশের ১৫ দিনের মধ্যে নিবন্ধন করতে বলে। অ-সম্মতির জন্য জরিমানা ৫০,০০০ টাকা পর্যন্ত। এটি এখন আগের চেয়ে সহজ — এবং এড়িয়ে যাওয়ার ঝুঁকি আগের চেয়ে বেশি।

## পুলিশ যাচাই কেন গুরুত্বপূর্ণ

- **যাচাইকৃত পরিচয়।** প্রক্রিয়াটি ভাড়াটের NID, ঠিকানার ইতিহাস এবং কোনো পরোয়ানা নেই তা নিশ্চিত করে
- **আইনি সুরক্ষা।** যাচাই সম্পূর্ণ করা সদিচ্ছা প্রদর্শন করে
- **দ্রুত বিরোধ নিষ্পত্তি।** যাচাইকৃত ভাড়াটেরা ভাড়া না দিয়ে পালালে সহজে পাওয়া যায়

## অনলাইন DMP ভাড়াটে নিবন্ধন প্রক্রিয়া

### ধাপ ১: প্রয়োজনীয় কাগজপত্র সংগ্রহ করুন

| কাগজপত্র | কে দেবেন |
|----------|----------|
| ভাড়াটের জাতীয় পরিচয়পত্র | ভাড়াটে |
| ভাড়াটের পাসপোর্ট ছবি | ভাড়াটে |
| প্রবেশকারী সকল প্রাপ্তবয়স্ক পরিবারের NID | ভাড়াটে |
| স্বাক্ষরিত ভাড়া চুক্তির কপি | বাড়িওয়ালা |
| বাড়ির মালিকের NID | বাড়িওয়ালা |

### ধাপ ২: পোর্টালে প্রবেশ করুন

DMP নাগরিক সেবা পোর্টাল ভিজিট করুন। "ভাড়াটিয়া নিবন্ধন" নির্বাচন করুন। অ্যাকাউন্ট তৈরি বা লগইন করতে আপনার NID নম্বর লাগবে।

### ধাপ ৩: নিবন্ধন ফর্ম পূরণ করুন

- ভবনের ঠিকানা ও ওয়ার্ড নম্বর
- ভাড়াটের ব্যক্তিগত তথ্য (NID অনুযায়ী)
- ভাড়া চুক্তির তারিখ ও মেয়াদ
- বাসিন্দার সংখ্যা

### ধাপ ৪-৫: কাগজপত্র আপলোড ও জমা দিন

জমা দেওয়ার পরে একটি ট্র্যাকিং নম্বর পাবেন। DMP ৩-৭ কার্যদিবসের মধ্যে নিবন্ধন প্রক্রিয়া করে।

## একাধিক ইউনিটের প্রক্রিয়া

প্রতিটি নতুন ভাড়াটেকে চুক্তি স্বাক্ষরের দিনে একটি মানক ডকুমেন্ট চেকলিস্ট দিন। প্রবেশের আগেই কাগজপত্র চান — পরে নয়।

## ১৫ দিনের সীমা মিস করলে কী করবেন

অবিলম্বে নিবন্ধন সম্পূর্ণ করুন। ঔচিত্যপূর্ণ দেরি অনেক ওয়ার্ডে সক্রিয় জরিমানার দিকে নিয়ে যায় না — তারা নোটিশ দিয়ে অনুসরণ করে।`,
    },
  },
  {
    slug: 'self-management-vs-agencies-bangladesh',
    date: '2026-04-18',
    readingTime: 7,
    author: { en: 'BariShamlai', bn: 'বাড়ি সামলাই' },
    category: { en: 'Property Management', bn: 'সম্পত্তি ব্যবস্থাপনা' },
    coverImage: '/blog/sc-cover.jpg',
    coverAlt: 'Landlord reviewing property management options',
    title: {
      en: 'Keep Your Profits: Self-Management vs. Property Agencies in Bangladesh',
      bn: 'আপনার লাভ রাখুন: বাংলাদেশে নিজে ব্যবস্থাপনা বনাম এজেন্সি',
    },
    excerpt: {
      en: 'Property management agencies charge 8–15% of collected rent. For most Dhaka landlords, self-management with the right tools is more profitable — and more in control. Here is how to decide.',
      bn: 'সম্পত্তি ব্যবস্থাপনা এজেন্সি সংগৃহীত ভাড়ার ৮-১৫% চার্জ করে। বেশিরভাগ ঢাকার বাড়িওয়ালার জন্য, সঠিক সরঞ্জাম দিয়ে নিজে ব্যবস্থাপনা আরও লাভজনক — এবং আরও নিয়ন্ত্রণে। এখানে সিদ্ধান্ত নেওয়ার পদ্ধতি আলোচনা করা হয়েছে।',
    },
    content: {
      en: `> For every 100 landlords in Dhaka who say they are "too busy to manage their property themselves," at least 80 could do it themselves — better and more profitably — with the right digital tools. Property agencies are valuable in specific situations. They are not the default solution they have been positioned as.

## What Agencies Actually Do (and Charge)

![Building manager at work](/blog/sc-building.jpg)

A typical property management agency in Bangladesh offers:

- Finding and screening tenants
- Collecting rent
- Handling maintenance requests
- Managing caretaker staff
- Handling legal disputes (in premium packages)

For this, they typically charge **8–12% of monthly collected rent** — sometimes as high as 15% for premium properties. On a building collecting ৳3,00,000/month, that is ৳24,000–৳45,000 per month going to the agency — ৳2,88,000–৳5,40,000 per year.

## The Case for Self-Management

**Cost.** The most direct benefit: you keep the 8–12%. On the numbers above, that is ৳3-5 lakh per year staying in your pocket.

**Control.** Agencies optimise for their own efficiency, not your property. Tenant screening done by an agency is less thorough than screening you do yourself — because you bear the consequences of a bad tenant, not them.

**Responsiveness.** When a pipe bursts at 11 PM, an agency's call center may take hours to respond. A landlord who manages their own building can make a decision in minutes.

**Relationship quality.** Landlords who engage directly with their tenants report significantly fewer disputes and longer tenancy durations. Agency-managed buildings tend to have higher turnover because tenants feel less connected.

## The Case for Using an Agency

Agencies make sense in specific situations:

| Situation | Agency May Be Right |
|-----------|-------------------|
| You live outside Bangladesh | ✓ For tenant finding and emergency response |
| You have 20+ units and no caretaker system | ✓ Centralised management saves time |
| The property is premium (Gulshan, Baridhara) | ✓ Agencies have premium tenant networks |
| You have no time and no digital system | ✓ Short-term, while you build a system |

## The Hybrid Approach: Best of Both

Many experienced Dhaka landlords use a hybrid model:

- **Agency for tenant finding only** (one-time fee of 1–2 months' rent)
- **Self-management with Bari Shamlai** for everything after move-in

This gets you access to the agency's tenant network for the hardest part (finding tenants) while keeping ongoing management in your hands.

## A Side-by-Side Comparison

| Task | Agency | Self-management with Bari Shamlai |
|------|--------|----------------------------------|
| Tenant finding | ✓ Good networks | ✗ Requires effort |
| Rent collection tracking | ✓ | ✓ Automated reminders |
| Expense transparency | ✗ You see only summaries | ✓ Full detail |
| Receipt management | ✗ Often manual | ✓ Automated PDFs |
| Emergency response | Slow (call center) | Fast (direct) |
| Monthly cost | 8–15% of rent | Fixed low fee |
| Your visibility | Low | High |

## Making the Decision

Ask yourself three questions:

1. Do I have 5–10 hours per month to review accounts and respond to tenant queries? (If yes: self-manage)
2. Is my building in a location where I cannot physically visit within 2 hours if needed? (If yes: consider a hybrid or local agent)
3. Do I have reliable, trusted help on the ground (a caretaker or family member)? (If yes: you probably do not need an agency)

Most landlords who answer these honestly find that self-management — with the right app — is the right answer.`,
      bn: `> ঢাকায় যে ১০০ জন বাড়িওয়ালা বলেন তারা "নিজে সম্পত্তি পরিচালনার জন্য খুব ব্যস্ত," তাদের মধ্যে কমপক্ষে ৮০ জন সঠিক ডিজিটাল সরঞ্জাম দিয়ে নিজেরাই করতে পারতেন।

## এজেন্সি আসলে কী করে (এবং চার্জ করে)

বাংলাদেশের একটি সাধারণ সম্পত্তি ব্যবস্থাপনা এজেন্সি অফার করে:
- ভাড়াটে খুঁজে পাওয়া ও যাচাই
- ভাড়া সংগ্রহ
- রক্ষণাবেক্ষণ অনুরোধ পরিচালনা

এর জন্য তারা সাধারণত মাসিক সংগৃহীত ভাড়ার **৮-১২% চার্জ করে**। ৩,০০,০০০ টাকা/মাস সংগ্রহকারী ভবনে তা ২৪,০০০-৩৬,০০০ টাকা/মাস — বছরে ২.৯-৪.৩ লাখ টাকা।

## নিজে ব্যবস্থাপনার পক্ষে যুক্তি

**খরচ।** ৮-১২% আপনার পকেটে থাকে।

**নিয়ন্ত্রণ।** এজেন্সি তাদের নিজেদের দক্ষতার জন্য অপ্টিমাইজ করে, আপনার সম্পত্তির জন্য নয়।

**সাড়া দেওয়ার গতি।** রাত ১১টায় পাইপ ফাটলে, এজেন্সির কল সেন্টার ঘণ্টা নিতে পারে। নিজে পরিচালিত বাড়িওয়ালা মিনিটে সিদ্ধান্ত নিতে পারেন।

## এজেন্সি ব্যবহারের পক্ষে যুক্তি

| পরিস্থিতি | এজেন্সি সঠিক হতে পারে |
|-----------|---------------------|
| বাংলাদেশের বাইরে থাকেন | ✓ ভাড়াটে খোঁজা ও জরুরি সাড়ার জন্য |
| ২০+ ইউনিট, কেয়ারটেকার সিস্টেম নেই | ✓ কেন্দ্রীভূত ব্যবস্থাপনা সময় বাঁচায় |
| প্রিমিয়াম সম্পত্তি | ✓ এজেন্সির প্রিমিয়াম ভাড়াটে নেটওয়ার্ক আছে |

## হাইব্রিড পদ্ধতি: উভয়ের সেরা

অনেক অভিজ্ঞ বাড়িওয়ালা হাইব্রিড মডেল ব্যবহার করেন:
- **শুধু ভাড়াটে খোঁজার জন্য এজেন্সি** (এক-কালীন ১-২ মাসের ভাড়া ফি)
- **বাড়ি সামলাই দিয়ে নিজে ব্যবস্থাপনা** প্রবেশের পরে সব কিছুর জন্য

নিজে ব্যবস্থাপনায় সিদ্ধান্ত নিন যদি: আপনার মাসে ৫-১০ ঘণ্টা সময় আছে, আপনার বিশ্বস্ত কেয়ারটেকার বা আত্মীয় আছেন, এবং আপনি বিস্তারিত জানতে চান।`,
    },
  },
  {
    slug: 'smart-home-property-trends-dhaka-2026',
    date: '2026-04-19',
    readingTime: 7,
    author: { en: 'BariShamlai', bn: 'বাড়ি সামলাই' },
    category: { en: 'PropTech', bn: 'প্রপটেক' },
    coverImage: '/blog/sc-city.jpg',
    coverAlt: 'Modern Dhaka cityscape with smart buildings',
    title: {
      en: 'PropTech 2026: Aligning Your Building with Smart Bangladesh',
      bn: 'প্রপটেক ২০২৬: স্মার্ট বাংলাদেশের সাথে আপনার ভবন সংযুক্ত করুন',
    },
    excerpt: {
      en: 'Smart home technology is arriving in Dhaka faster than most landlords expect. Buildings that adopt early attract premium tenants and command higher rents. Here is what is practical for 2026.',
      bn: 'স্মার্ট হোম প্রযুক্তি বেশিরভাগ বাড়িওয়ালার প্রত্যাশার চেয়ে দ্রুত ঢাকায় আসছে। যে ভবনগুলো আগে গ্রহণ করে তারা প্রিমিয়াম ভাড়াটে আকর্ষণ করে এবং বেশি ভাড়া পায়। ২০২৬ সালে কী ব্যবহারিক তা এখানে আলোচনা করা হয়েছে।',
    },
    content: {
      en: `> Bangladesh's government has committed to a "Smart Bangladesh" vision for 2041. In 2026, the practical implications for residential buildings are already being felt in the premium segments of Dhaka — and they will reach mid-range buildings within 3–5 years.

## Where Dhaka PropTech Stands in 2026

![Modern Dhaka city with residential buildings](/blog/buildings-inline.jpg)

Three categories of smart building technology are now commercially available and cost-effective in Bangladesh:

### 1. Smart Metering and Utility Management

Sub-metering solutions from local providers now allow building owners to:
- Track individual flat electricity consumption in real-time
- Generate automated utility bills based on actual usage (rather than flat-rate allocation)
- Identify high-consumption periods and anomalies

**Cost:** Smart meter installation for a 10-unit building: ৳40,000–৳80,000. Break-even from billing accuracy: typically under 12 months.

**Tenant benefit:** Tenants pay for what they actually use — a strong selling point versus buildings where consumption is split equally regardless of usage.

### 2. IP-Based CCTV and Access Control

Full HD IP cameras with remote viewing and motion-activated recording are now available for under ৳5,000 per camera. An 8-camera system covering all common areas costs ৳40,000–৳60,000 installed.

Key features worth investing in:
- **Remote viewing via smartphone:** Check your building from anywhere, anytime
- **Cloud backup:** 30-day rolling footage stored in the cloud (eliminates the DVR that caretakers can "accidentally" reset)
- **Video doorbell at main gate:** Know who enters without being present

Access control (digital key fobs or smartphone-based entry) is now being adopted in new Gulshan and Banani buildings. Cost for a 20-unit building: ৳1,50,000–৳2,50,000.

### 3. Automated Bill Reminders and Digital Payments

This is the most cost-effective PropTech investment available today — and it requires no hardware at all. Platforms like Bari Shamlai deliver:

- Automated WhatsApp and SMS reminders before rent is due
- bKash and bank transfer payment confirmation
- Instant PDF receipts
- Monthly collection summary reports

For buildings that have moved to digital payment collection, late payments drop by 40–60% on average in the first three months.

## The Smart Renovation Budget Calculator

If you are renovating a unit, here is where PropTech spending pays back fastest:

| Investment | Cost (per unit) | Rental Premium | Payback Period |
|------------|----------------|---------------|----------------|
| Smart meter | ৳4,000–৳6,000 | ৳500–৳1,000/mo | 6–10 months |
| Smart door lock | ৳8,000–৳15,000 | ৳1,000–৳2,000/mo | 8–12 months |
| WiFi router (common area) | ৳3,000–৳5,000 | ৳1,500–৳3,000/mo | 2–3 months |
| Building app (Bari Shamlai) | Minimal | Reduced vacancy | Immediate |

## What Tenants in 2026 Actually Want

Based on tenant surveys across premium Dhaka properties, the top three technology amenities that tenants pay premium for:

1. **Reliable high-speed WiFi in common areas** (and offered as optional in-unit upgrade)
2. **24/7 CCTV with remote viewing** — families in particular cite this as a safety decision factor
3. **Digital payment options** — especially young professionals who do not carry cash

Building owners who invest in these three areas first achieve the highest ROI on their PropTech spending. The IoT-enabled refrigerator and voice-activated lights can wait.`,
      bn: `> বাংলাদেশ সরকার ২০৪১ সালের "স্মার্ট বাংলাদেশ" লক্ষ্যে প্রতিশ্রুতিবদ্ধ। ২০২৬ সালে, আবাসিক ভবনের ব্যবহারিক প্রভাব ঢাকার প্রিমিয়াম সেগমেন্টে ইতিমধ্যেই অনুভূত হচ্ছে।

## ২০২৬ সালে ঢাকার প্রপটেক কোথায় দাঁড়িয়ে

তিনটি বিভাগের স্মার্ট বিল্ডিং প্রযুক্তি এখন বাণিজ্যিকভাবে পাওয়া যাচ্ছে:

### ১. স্মার্ট মিটারিং এবং ইউটিলিটি ব্যবস্থাপনা

স্থানীয় প্রদানকারীদের সাব-মিটারিং সমাধান বাড়িওয়ালাদের সুযোগ দেয়:
- প্রতিটি ফ্ল্যাটের বিদ্যুৎ খরচ রিয়েল-টাইমে ট্র্যাক করতে
- প্রকৃত ব্যবহারের ভিত্তিতে স্বয়ংক্রিয় ইউটিলিটি বিল তৈরি করতে

**খরচ:** ১০-ইউনিট ভবনে স্মার্ট মিটার স্থাপন: ৪০,০০০-৮০,০০০ টাকা।

### ২. IP-ভিত্তিক CCTV এবং অ্যাক্সেস কন্ট্রোল

প্রতিটি ক্যামেরার দাম ৫,০০০ টাকার নিচে। একটি ৮-ক্যামেরা সিস্টেম ৪০,০০০-৬০,০০০ টাকায় স্থাপন করা যায়।

বিনিয়োগের যোগ্য ফিচার:
- **স্মার্টফোনে রিমোট ভিউয়িং:** যেকোনো জায়গা থেকে আপনার ভবন দেখুন
- **ক্লাউড ব্যাকআপ:** ৩০ দিনের রোলিং ফুটেজ ক্লাউডে সংরক্ষিত

### ৩. স্বয়ংক্রিয় বিল অনুস্মারক এবং ডিজিটাল পেমেন্ট

এটি আজ পাওয়া সবচেয়ে সাশ্রয়ী প্রপটেক বিনিয়োগ — এবং এতে কোনো হার্ডওয়্যার লাগে না। বাড়ি সামলাই প্রদান করে:
- ভাড়া বকেয়া হওয়ার আগে স্বয়ংক্রিয় হোয়াটসঅ্যাপ ও SMS অনুস্মারক
- তাৎক্ষণিক পিডিএফ রসিদ

ডিজিটাল পেমেন্ট সংগ্রহে স্থানান্তরিত ভবনগুলিতে প্রথম তিন মাসে গড়ে ৪০-৬০% দেরি পেমেন্ট কমে।

## ২০২৬ সালে ভাড়াটেরা আসলে কী চান

প্রিমিয়াম ঢাকার সম্পত্তিতে সমীক্ষার ভিত্তিতে শীর্ষ তিনটি প্রযুক্তি সুবিধা:

১. **সাধারণ এলাকায় নির্ভরযোগ্য উচ্চগতির WiFi**
২. **রিমোট ভিউয়িং সহ ২৪/৭ CCTV**
৩. **ডিজিটাল পেমেন্ট বিকল্প**

এই তিনটি এলাকায় প্রথম বিনিয়োগকারী বাড়ির মালিকরা সর্বোচ্চ ROI পান।`,
    },
  },
  {
    slug: 'transparent-service-charges-dhaka-apartments',
    date: '2026-04-20',
    readingTime: 6,
    author: { en: 'BariShamlai', bn: 'বাড়ি সামলাই' },
    category: { en: 'Building Management', bn: 'ভবন ব্যবস্থাপনা' },
    coverImage: '/blog/sc-cover.jpg',
    coverAlt: 'Building management meeting reviewing accounts',
    title: {
      en: 'Building Trust Through Transparent Service Charges',
      bn: 'স্বচ্ছ সার্ভিস চার্জের মাধ্যমে আস্থা গড়ুন',
    },
    excerpt: {
      en: 'The fastest way to end service charge disputes in your building is radical transparency — showing tenants exactly what their money pays for. Buildings that do this report near-zero collection conflicts.',
      bn: 'আপনার ভবনে সার্ভিস চার্জ বিরোধ শেষ করার দ্রুততম উপায় হলো চরম স্বচ্ছতা — ভাড়াটেদের ঠিক কী কী খরচে তাদের অর্থ যাচ্ছে তা দেখানো। যে ভবনগুলো এটি করে তারা প্রায় শূন্য সংগ্রহ দ্বন্দ্বের কথা জানায়।',
    },
    content: {
      en: `> "Why do we pay ৳5,000 service charge when the building looks like it isn't maintained?" This is the question every building manager dreads — not because the money is wasted, but because no one has ever explained where it goes.

## Why Service Charge Disputes Are Almost Always About Information, Not Money

In our experience working with hundreds of buildings in Dhaka, the most common cause of service charge disputes is not that tenants think the charge is too high — it is that they have no idea what it pays for.

When tenants do not understand the cost breakdown, they fill the gap with assumptions — and those assumptions are almost always less charitable than reality. A building spending ৳90,000/month on staff, electricity, and maintenance is seen as "overcharging" when the only information shared is "service charge: ৳3,000/flat."

Transparency closes this gap.

## The Monthly Service Charge Statement

The most powerful tool for ending service charge disputes is a monthly expense statement shared with tenants. It does not need to be sophisticated. A simple breakdown is enough:

![Building management meeting](/blog/sc-meeting.jpg)

**Sample Monthly Expense Statement — April 2026**

| Expense Category | Monthly Cost |
|-----------------|-------------|
| Security staff (2 guards) | ৳22,000 |
| Cleaning staff (1 person) | ৳10,000 |
| Caretaker salary | ৳12,000 |
| Common area electricity | ৳18,500 |
| Lift maintenance (AMC monthly) | ৳4,200 |
| Repairs and maintenance | ৳6,300 |
| Water pump maintenance | ৳2,000 |
| Sinking fund contribution | ৳5,000 |
| **Total expenses** | **৳80,000** |
| **Total collected (20 flats × ৳4,000)** | **৳80,000** |

A statement like this, shared via WhatsApp group or printed and posted in the common area, makes the service charge self-explanatory. Tenants stop asking "why so much?" and start asking "why is common area electricity so high?" — which is a much more productive conversation.

## How to Implement Transparent Service Charge Reporting

**Step 1: Start recording every expense.** Log all expenses in Bari Shamlai as they occur — not at month-end from memory. Include the vendor, amount, and category.

**Step 2: Set up a WhatsApp group for building announcements.** A simple building-wide group (not for complaints or discussions — just announcements) is the most practical channel for sharing the monthly statement.

**Step 3: Share the statement on the 5th of each month.** The 5th is after the collection period (typically 1st–3rd) and before tenants start questioning the next payment.

**Step 4: Show the trend over time.** After 3–6 months, show year-to-date totals. When tenants can see that expenses have grown 12% over two years — mirroring inflation — a 10% service charge increase becomes easy to accept.

## What Transparency Does Not Solve

Transparency solves disputes rooted in information gaps. It does not solve:
- Genuine cost-cutting disagreements (tenants who want fewer guards, for example)
- Situations where actual waste or mismanagement exists in the accounts
- Tenants who dispute despite being shown full accounts

For genuine disagreements, convening a building committee meeting with all tenants present is the right next step. For buildings with Bari Shamlai, the platform generates ready-made reports that can be projected at such meetings, making the conversation evidence-based rather than emotional.

The investment in transparency is minimal. The returns — in reduced conflict, higher on-time payment rates, and longer tenant retention — are among the highest of any management change you can make.`,
      bn: `> "বিল্ডিং রক্ষণাবেক্ষণ ঠিকমতো হচ্ছে না মনে হয় — আমরা কেন ৫,০০০ টাকা সার্ভিস চার্জ দিচ্ছি?" এটাই প্রতিটি বিল্ডিং ম্যানেজারের ভয়ের প্রশ্ন।

## সার্ভিস চার্জ বিরোধ প্রায়ই তথ্যের অভাব, অর্থের নয়

আমাদের অভিজ্ঞতায়, সার্ভিস চার্জ বিরোধের সবচেয়ে সাধারণ কারণ হলো ভাড়াটেরা জানেন না এটি কীসের জন্য দেওয়া হয়।

যখন ভাড়াটেরা খরচের বিভাজন বোঝেন না, তারা অনুমান দিয়ে পূরণ করেন — এবং সেই অনুমানগুলো প্রায় সর্বদা বাস্তবের চেয়ে কম সহানুভূতিশীল। মাসে ৯০,০০০ টাকা কর্মী, বিদ্যুৎ ও রক্ষণাবেক্ষণে ব্যয়কারী একটি ভবনকে "অতিরিক্ত চার্জ" করছে বলে মনে হয় যখন শুধু "সার্ভিস চার্জ: ৩,০০০ টাকা/ফ্ল্যাট" জানানো হয়।

স্বচ্ছতা এই ব্যবধান বন্ধ করে।

## মাসিক সার্ভিস চার্জ বিবৃতি

**নমুনা মাসিক ব্যয় বিবৃতি — এপ্রিল ২০২৬**

| ব্যয়ের বিভাগ | মাসিক খরচ |
|--------------|-----------|
| নিরাপত্তা কর্মী (২ জন গার্ড) | ২২,০০০ টাকা |
| পরিষ্কার কর্মী (১ জন) | ১০,০০০ টাকা |
| কেয়ারটেকারের বেতন | ১২,০০০ টাকা |
| সাধারণ এলাকার বিদ্যুৎ | ১৮,৫০০ টাকা |
| লিফট রক্ষণাবেক্ষণ (AMC মাসিক) | ৪,২০০ টাকা |
| মেরামত ও রক্ষণাবেক্ষণ | ৬,৩০০ টাকা |
| ওয়াটার পাম্প রক্ষণাবেক্ষণ | ২,০০০ টাকা |
| সিংকিং ফান্ড অবদান | ৫,০০০ টাকা |
| **মোট ব্যয়** | **৮০,০০০ টাকা** |
| **মোট সংগৃহীত (২০ ফ্ল্যাট × ৪,০০০)** | **৮০,০০০ টাকা** |

এই ধরনের বিবৃতি, হোয়াটসঅ্যাপ গ্রুপে শেয়ার করলে বা সাধারণ এলাকায় পোস্ট করলে, সার্ভিস চার্জকে স্ব-ব্যাখ্যামূলক করে তোলে।

## স্বচ্ছ সার্ভিস চার্জ রিপোর্টিং কার্যকর করা

**ধাপ ১:** বাড়ি সামলাইতে ঘটার সাথে সাথে প্রতিটি ব্যয় লগ করুন।

**ধাপ ২:** বিল্ডিং ঘোষণার জন্য একটি হোয়াটসঅ্যাপ গ্রুপ তৈরি করুন।

**ধাপ ৩:** প্রতি মাসের ৫ তারিখে বিবৃতি শেয়ার করুন।

**ধাপ ৪:** সময়ের সাথে প্রবণতা দেখান। ভাড়াটেরা দেখতে পেলে যে খরচ ২ বছরে ১২% বেড়েছে — মুদ্রাস্ফীতির মতোই — ১০% সার্ভিস চার্জ বৃদ্ধি সহজে গৃহীত হয়।

স্বচ্ছতায় বিনিয়োগ ন্যূনতম। ফলাফল — কম দ্বন্দ্ব, বেশি সময়মতো পেমেন্ট, দীর্ঘ ভাড়াটে ধারণ — যেকোনো ব্যবস্থাপনা পরিবর্তনের মধ্যে সর্বোচ্চ।`,
    },
  },
]

export function getPost(slug: string): Post | undefined {
  return posts.find(p => p.slug === slug)
}
