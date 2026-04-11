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
    author: { en: 'Tuhin', bn: 'তুহিন' },
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
    author: { en: 'Tuhin', bn: 'তুহিন' },
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
    author: { en: 'Tuhin', bn: 'তুহিন' },
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
    author: { en: 'Tuhin', bn: 'তুহিন' },
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
]

export function getPost(slug: string): Post | undefined {
  return posts.find(p => p.slug === slug)
}
