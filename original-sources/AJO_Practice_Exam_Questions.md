# Adobe Journey Optimizer Certification Practice Exam

**Time Limit:** 60 minutes (similar to actual exam)  
**Question Count:** 20 questions (mix of all topics)  
**Passing Score:** Approximately 70%+  
**Format:** Multiple choice (A, B, C, D)

---

## INSTRUCTIONS

1. Answer all 20 questions
2. Try not to reference your study guide
3. Write down your answers
4. Check the answer key after you complete all questions
5. Review explanations for any you got wrong
6. Focus on understanding WHY the answer is correct

---

# PRACTICE EXAM QUESTIONS

## Question 1: Guardrails - Activity Limit

A marketer is building a customer lifecycle journey that includes:
- Welcome email
- 7-day wait
- Engagement check (condition)
- 2 email branches based on engagement
- 3-day wait on each branch
- SMS action
- Product recommendation offer decision
- Update profile activity
- 2 additional email sends per branch
- Final evaluation condition
- Exit activities

When they try to publish, the system returns an error. The journey has 48 activities total, well below the 50-activity limit.

**What is the issue?**

A) The 48-activity count is correct; the error is about payload size, not activity count. Reduce email content to under 1 MB.

B) Activity count reached the guardrail at a different stage. The system also counts wait activities AND condition branches, which the marketer didn't account for. Must split the journey.

C) This shouldn't fail on activity count at 48. The issue is likely that the journey exceeds the 2 MB message content limit across all email messages combined. Simplify email content.

D) The system rejects journeys with more than 1 condition. Remove the second condition and use a single email send instead.

**Answer:** See answer key below

---

## Question 2: Journey Type - Event-Triggered vs. Scheduled

A financial services company wants to build a campaign for customers who reach their annual spending limit. Here's what happens:

- Customer spends to their limit (tracked in real-time in their profile)
- System needs to respond within 15 minutes
- Send personalized email about annual refresh options
- Offer financial planning consultation
- If they click the email, send confirmation SMS
- If they don't click in 24 hours, send SMS without email link

Which journey type is appropriate?

A) Read Audience journey that runs every 15 minutes to check for customers at their spending limit and sends the initial email.

B) Unitary event journey triggered by a custom event that fires when spending limit is reached, allowing real-time response within minutes.

C) Business event journey that aggregates daily spending and sends offers batch-processed overnight.

D) Audience Qualification journey that monitors spending limit attribute changes in real-time.

**Answer:** See answer key below

---

## Question 3: Guardrails - 1 MB Instance Limit Diagnosis

A B2B company runs a journey for accounts that download whitepapers. They observe:

- 10,000 profiles entered the journey
- 9,200 completed successfully
- 800 profiles in ERROR status mid-journey
- Error logs show "Journey instance size exceeded"

Investigation reveals:
- All 800 error profiles are from Fortune 500 companies
- Standard/mid-market accounts (9,200) completed fine
- Fortune 500 accounts have significantly more historical contract data

What's the root cause and solution?

A) The company should switch from a unitary event journey to a Read Audience journey. Read Audience journeys don't have the 1 MB instance limit.

B) The 1 MB journey instance limit is being exceeded for Fortune 500 accounts due to accumulated profile data (larger account records with extensive contract history). Solution: Reduce data retrieval from APIs or simplify conditions.

C) The error indicates the journey activity limit was exceeded. At 800 errors, the system automatically stopped processing. Must split journey.

D) This is a data governance issue. Fortune 500 data is labeled S1 and cannot be used in journeys. Remove sensitive data references.

**Answer:** See answer key below

---

## Question 4: Content Authoring - Fragments

A company wants to build an email campaign with:

1. Dynamic greeting: "Hi {{firstName}}, you have {{pointsBalance}} loyalty points"
2. Reusable logo/footer: Same branded footer in every email
3. Conditional message: "If VIP tier, show 'Exclusive offer'. If Standard, show 'Limited offer'"
4. Personalized offers: Based on purchase history

They ask: "Which should be fragments and which should be personalization fields?"

A) Create everything as personalization fields. Fragments are only for A/B testing, not for personalization.

B) The logo/footer as visual fragment, and all dynamic content (greeting, tier message, offers) as personalization fields. This separates static design from dynamic customer data.

C) The logo/footer as visual fragment, the greeting as personalization field, BUT the conditional tier message as expression fragment, and offers as personalization fields.

D) Everything as expression fragments since all of it is dynamic. This keeps all logic in one place.

**Answer:** See answer key below

---

## Question 5: Offer Decisioning - Capping Logic

An insurance company set up offer decisioning with:

**Collection:** "Auto Insurance Products"
- Offer A: "Full Coverage - $150/month" (priority 1)
- Offer B: "Basic Coverage - $80/month" (priority 2)
- Offer C: "Premium Coverage - $200/month" (priority 3)

**Decision rules:**
- Eligibility: Drivers with clean driving record
- Ranking: By priority (A > B > C)
- Capping: Each offer capped at 3 times per customer per month

A customer qualifies for the decision (clean record). They've already received Offer A three times this month.

What offer does the system deliver?

A) The system will deliver Offer A again. Capping only prevents the same person from getting the offer on the same day, not across the month.

B) The system will deliver Offer B. It skips the capped Offer A and ranks Offer B next (which hasn't reached cap).

C) The system will deliver the fallback offer because the top priority offer is capped and the entire decision fails.

D) The system will deliver nothing. All offers are potentially at risk since they might exceed monthly caps. Must wait until next month.

**Answer:** See answer key below

---

## Question 6: AEP Foundations - Schema Types

A retailer wants to track both customer attributes AND purchase events in AEP. They create:

**Dataset 1 - Customer Attributes:**
- firstName, lastName, email, tier (VIP/Standard), loyaltyPoints, lastPurchaseDate
- Schema type: Profile Schema
- Enabled for profile: YES

**Dataset 2 - Purchase Events:**
- purchaseID, purchaseDate, amount, productName, channel
- Schema type: ExperienceEvent Schema
- Enabled for profile: YES

A marketer builds a journey condition: "IF customer loyaltyPoints > 1000 AND spent > $500 in last 30 days"

Which statement is correct?

A) Only Dataset 1 needs to be enabled for profile. Dataset 2 (events) cannot be used for real-time profile attribute lookups.

B) Both datasets should be enabled for profile from the START. Dataset 1 (Profile Schema) provides attributes; Dataset 2 (ExperienceEvent Schema) provides event history. Both must be accessible for the condition to work.

C) Only Dataset 2 needs to be enabled for profile. Event data is what drives journey decisions, not static attributes.

D) Neither dataset should be enabled for profile. Use a data source instead to query both customer and purchase data at journey time.

**Answer:** See answer key below

---

## Question 7: Journey Types - Read Audience Concurrency

A company has 7 marketing teams. Each wants to schedule a Read Audience journey:

- Team A: 8:00 AM (High-Value Customers)
- Team B: 8:05 AM (Seasonal Promotion)
- Team C: 8:10 AM (Newsletter Subscribers)
- Team D: 8:15 AM (Cart Abandoners)
- Team E: 8:20 AM (New Customers)
- Team F: 8:25 AM (VIP Retention)
- Team G: 8:30 AM (Loyalty Program)

Assuming each job takes 1 hour to complete, what happens?

A) All 7 journeys publish successfully. The 5-minute spacing between starts ensures no concurrency issues.

B) Teams A-E (5 teams) publish successfully. Team F at 8:25 AM is blocked because it would be the 6th concurrent instance (5-instance limit). Team G can be scheduled for a different time.

C) Only Teams A-C publish. The 10-minute spacing rule requires at least 10 minutes between start times, not 5.

D) All teams except Team G publish. With 1-hour job duration and 5-minute spacing, only the last team (Team G at 8:30) would exceed the limit.

**Answer:** See answer key below

---

## Question 8: Guardrails - Event Payload Size

A travel company sends a booking confirmation event to trigger a journey:

**Event payload includes:**
- Booking confirmation details: 8 KB
- Full itinerary (flights, hotels, car rental): 25 KB
- Customer preferences (seat, room type, etc.): 12 KB
- Full travel history (past 5 years of bookings): 35 KB
- **Total: 80 KB**

When this event enters the journey system:

A) The event will be accepted. It's under the 1 MB journey instance limit, so no problem.

B) The event will be accepted. 80 KB is under the 64 KB event payload limit... wait, that's not right. The event exceeds 64 KB and will be silently dropped. Profiles won't enter the journey.

C) The event will be accepted but cause mid-journey errors. The accumulated data during journey execution will exceed 1 MB. Only some profiles will error.

D) The event will be accepted. The 64 KB limit only applies to business events, not unitary events.

**Answer:** See answer key below

---

## Question 9: Content Authoring - Content Experiment Interpretation

An email campaign ran an A/B test on call-to-action button text:

```
Control: "Shop Now"
  - 50,000 sent
  - 2,500 clicks (5% CTR)
  
Variant B: "Get 20% Off"
  - 50,000 sent
  - 2,750 clicks (5.5% CTR)
  
Variant C: "Limited Time Offer"
  - 50,000 sent
  - 2,650 clicks (5.3% CTR)
```

Variant B won with the highest click rate. The marketer asks: "What should we test next?"

A) Keep testing CTA button text variations. The slight improvement (5% to 5.5%) means more refinement is needed.

B) The differences are very small (0.5% between best and worst). The CTA button variable is likely already optimized. Test a different variable like send time, email layout, or offer value.

C) Declare Variant B the permanent winner and use it in all future emails without further testing.

D) The experiment is inconclusive. The 50K sample per variant isn't large enough. Rerun with 100K per variant for statistical significance.

**Answer:** See answer key below

---

## Question 10: Journey Building - Unitary Event Reentrance

A retail company built a unitary event journey triggered by "product_viewed" event:

- Customer views Product A at 2:01 PM
- Journey triggers, sends "Still interested?" email
- Customer views Product A again at 2:03 PM (same product, same event type)
- System should send another email

What actually happens?

A) The customer receives two emails. Each event triggers the journey separately; there's no limit on separate events.

B) The customer receives only one email. The 5-minute reentrance block prevents the same journey from starting again until 2:06 PM.

C) The customer receives two emails. The 5-minute block only applies if it's the exact same event at the exact same time (2:01 PM exactly).

D) The system sends no emails. The duplicate product view triggers an error state.

**Answer:** See answer key below

---

## Question 11: Offer Decisioning - Static vs. Dynamic

A subscription company created these offers:

**Offer A:** "Get 30% off annual plans"

**Offer B:** "Save {{discountPercentage}}% with code {{promoCode}} — Expires {{expirationDate}}"

**Offer C:** "Enjoy {{planType}} plan benefits: {{benefitsList}}"

Which offers should be configured as DYNAMIC offers?

A) Only Offer A is dynamic. It's the most personalized of the three.

B) Offer A is static. Offers B and C contain {{variables}}, so they're dynamic.

C) All three should be dynamic for consistency across the campaign.

D) Offers B and C are dynamic, but Offer A could be either static or dynamic depending on the audience.

**Answer:** See answer key below

---

## Question 12: AEP Foundations - Identity Merging

A customer's journey in AEP:

**Day 1, 2 PM:** Anonymous browser session
- System assigns ECID: ECID-67890
- Customer views 10 products, adds 3 to cart
- All tracked under ECID-67890

**Day 1, 2:30 PM:** Customer creates account
- Enters email: jane@example.com
- System links ECID-67890 + email to same profile
- CRM ID in database: CUST-54321
- All three IDs merge to one profile

**Day 2, 10 AM:** Read Audience journey checks for "customers who viewed 10+ products"

Does the system find Jane?

A) No. The product views happened before she created her account. Anonymous behavior doesn't count toward authenticated customer segments.

B) Yes. When identity merged, all historical data (product views from ECID time) automatically linked to Jane's authenticated profile. Journey condition finds 10+ views.

C) Partially. The 10 product views are found, but Jane won't get the offer because she only had 3 items in cart (threshold might be higher).

D) The system cannot query anonymous data. Must wait 24 hours for a full sync of historical behavior to authenticated profile.

**Answer:** See answer key below

---

## Question 13: Guardrails & Journey Type - Multiple Issues

A company designed a journey that:
- Triggers on unitary event "page_view" (event payload: 20 KB)
- Immediately sends email to everyone (Activity 1)
- Waits 1 day
- Checks if customer is in "Active" audience (Activity 2)
- Sends SMS based on decision (Activity 3)
- Calls custom action (Activity 4)
- Updates profile (Activity 5)
- Then REPEATS the cycle 8 more times

Total: 44 activities

When trying to publish, they get a warning about payload size (90% of limit), but the publish succeeds.

After 1 day in production, the company observes:
- 50,000 profiles entered
- 45,000 completed journey
- 5,000 profiles in ERROR status mid-journey
- All error profiles are accounts with 10+ years of historical purchase data
- All successful profiles are customers with <5 years of history

What is happening?

A) The journey reached the 50-activity limit and stopped processing after 44 activities. Must reduce to fewer activities.

B) The 20 KB event + accumulated profile data for high-history accounts is pushing over the 1 MB instance limit mid-journey, causing ERROR status. Reduce profile data retrieval or simplify.

C) The custom action capping limit was exceeded. These profiles triggered the action too many times, hitting the 300K calls/min limit.

D) This is a data freshness issue. Waiting 1 day causes profile attributes to become stale, triggering errors for accounts with historical complexity.

**Answer:** See answer key below

---

## Question 14: Content Authoring - Expression Fragment Channels

A company created an expression fragment with loyalty tier logic:

```
{{if profile.attributes.tier == "GOLD" 
   then "Free shipping + 20% off" 
   else "10% off"}}
```

They want to use it in:
- Email campaign
- SMS campaign
- In-app mobile message

The fragment is in "Live" status.

What happens when they publish journeys using this fragment?

A) All three journeys work. Expression fragments are compatible with all channels.

B) Email and SMS work. In-app campaign fails because expression fragments cannot be used in in-app messages. Must use personalization fields or visual fragments for in-app.

C) Only email works. Expression fragments are email-only, designed for complex email logic.

D) The fragment must be "Published" status (not "Live") to work in journeys. Change status and retry.

**Answer:** See answer key below

---

## Question 15: AEP Foundations - Profile vs. Event Data

A company ingests customer data:

**Data 1:** memberID, firstName, lastPurchaseDate, loyaltyTier, accountStatus
**Data 2:** purchaseID, purchaseDate, purchaseAmount, itemsSold, currency
**Data 3:** memberID, updateDate, lastLogin, lastClickDate, sessionDuration

They want to use all this data in journeys for personalization. Which should be from Profile Schema (not Event Schema)?

A) All three. Everything is customer-related data.

B) Data 1 only. It contains customer attributes that don't have timestamps.

C) Data 1 and Data 3. Data 2 (purchases with amounts and dates) should come from Event Schema.

D) Data 1 and Data 3. All three except Data 2, which is too detailed for profile use.

**Answer:** See answer key below

---

## Question 16: Journey Validation - What's Checked?

A marketer creates a journey and clicks "Validate" before publishing. The validation checks the following:

Which of these WILL cause validation to fail (blocking publish)?

A) The journey has 52 activities. Validation catches this and blocks with error "50-activity limit exceeded."

B) The personalization field {{profile.attributes.customField}} references a field that doesn't exist in the schema. Validation catches this and blocks with error.

C) The journey logic requires "IF customer is VIP AND made purchase > $1000, send premium offer. ELSE send standard offer." Validation checks syntax but doesn't evaluate if this logic makes business sense.

D) The email message content is 1.5 MB authored size. Validation warns (soft warning, allows publish) because it's under the 2 MB backend limit.

**Answer:** See answer key below

---

## Question 17: Journey Building - Audience Qualification Timing

A company set up an Audience Qualification journey that listens for real-time audience membership changes. When a customer's churn score crosses a threshold, they're added to "High Churn Risk" audience.

Expected behavior: When customer enters audience, journey triggers immediately and sends retention email.

Observed behavior: Customer enters audience at 10:05 AM, but doesn't receive email until 10:12 AM (7-minute delay).

What's the issue?

A) This is incorrect configuration. Audience Qualification activities don't support real-time triggering. Must use a Unitary Event journey instead.

B) The journey has the correct setup. The 10-minute activation delay is a known guardrail. Audiences take up to 10 minutes to start listening for membership changes.

C) The email send was delayed by the system due to the 5-minute reentrance block.

D) There's a data syncing delay. The churn score updated at 10:05 AM, but the audience didn't recalculate until 10:12 AM.

**Answer:** See answer key below

---

## Question 18: Offer Decisioning - Using in Journeys

A company built offer decisioning with:
- 10 different product offers in a "New Customers" collection
- Decision policy that ranks offers by customer segment and location
- Fallback offer: "Generic 10% discount"

They deploy this in a journey using a Content Decision activity in the email body.

The email is sent to 100K new customers. They observe:
- 85K customers see their personalized offer
- 15K customers see the fallback "Generic 10% discount"

The company asks: "Why are 15K customers getting the fallback offer instead of a personalized one?"

A) The fallback offer is being shown because too many offers were delivered (hit frequency cap). The offers are cycling through fallback as a safeguard.

B) Those 15K customers likely didn't match the eligibility rules for any of the 10 offers in the collection. The decision evaluated rules, found no matches, and displayed the fallback offer.

C) The fallback offer is randomly shown to 15% of customers to test its effectiveness. This is normal behavior.

D) There's a system error. 100% of customers should see personalized offers. Only 85K indicate successful offer decisioning; the other 15K didn't receive any offer.

**Answer:** See answer key below

---

## Question 19: Guardrails - Combining Multiple Limits

A journey logs customer activity with large API responses. Data per profile:
- Event payload: 10 KB
- Profile attributes: 100 KB
- API response 1: 200 KB
- API response 2: 180 KB
- Email content: 150 KB
- **Total: 640 KB per profile**

For a profile with higher data needs:
- Event payload: 15 KB
- Profile attributes: 300 KB (more historical data)
- API response 1: 400 KB
- API response 2: 350 KB
- Email content: 150 KB
- **Total: 1,215 KB per profile**

What happens?

A) Both profiles complete successfully. 640 KB and 1,215 KB are both under the 2 MB email content limit.

B) Profile 1 (640 KB) completes. Profile 2 (1,215 KB) is marked ERROR because it exceeds the 1 MB journey instance limit.

C) Both profiles fail at journey entry because the event payload exceeds 64 KB.

D) Profile 2 fails because it exceeds the 2 MB message limit. Profile 1 succeeds.

**Answer:** See answer key below

---

## Question 20: Journey Type Decision - Complex Scenario

A financial services company wants to send investment opportunity emails to customers based on their account status. Here's the requirement:

- Send to customers whose "Investment Ready" score just changed to YES
- Must send within 1 hour of score change (real-time trigger)
- Email shows investment options matching their risk profile
- Wait 48 hours
- Check if customer clicked email or logged into investment portal
- If YES → send follow-up with personalized portfolio suggestions
- If NO → send SMS reminder
- Multi-day nurture sequence continues based on engagement

Which journey type is best?

A) Read Audience journey that runs hourly to find customers whose Investment Ready score changed to YES.

B) Business event journey triggered when the Investment Ready score event fires.

C) Unitary event journey triggered by an event that fires when Investment Ready score changes to YES. This provides real-time response within hours and supports the multi-step branching.

D) Audience Qualification journey listening for real-time membership changes in "Investment Ready" audience.

**Answer:** See answer key below

---

---

# ANSWER KEY & EXPLANATIONS

## Q1: Guardrails - Activity Limit

**Correct Answer: C**

**Why C is right:**
The journey has 48 activities, which is under the 50-activity limit. The error isn't about activity count — it's about **email message content size**. After backend processing (patching links, applying transformations), the total message payload across all emails in the journey exceeds the 2 MB limit. Solution: Reduce email content to keep authored emails under 1 MB each.

**Why others are wrong:**
- **A)** Correct diagnosis (payload size) but directs to wrong guardrail (1 MB is journey instance, 2 MB is email message content)
- **B)** Misunderstands what causes the error. Activity count is 48, well below 50 limit
- **D)** No guardrail about multiple conditions; this is false

**Exam lesson:** Message content size is checked at publish time and can exceed 2 MB after backend processing, even if authored content seems smaller.

---

## Q2: Journey Type - Event-Triggered vs. Scheduled

**Correct Answer: B**

**Why B is right:**
- ✅ 15-minute real-time response required → Unitary event (not Read Audience which is batch)
- ✅ Reacts to customer action (spending limit reached) → Event-driven
- ✅ Multi-step with branching (email → click/no-click → SMS) → Supported in unitary event

**Why others are wrong:**
- **A)** Read Audience is batch/scheduled, not real-time. 15-minute requirement not met
- **C)** Business event is for external/scheduled triggers, not real-time customer actions
- **D)** Audience Qualification possible but not ideal for spending-based triggers; unitary event is cleaner

**Exam lesson:** "Real-time response needed" → Unitary event. "Scheduled batch" → Read Audience.

---

## Q3: Guardrails - 1 MB Instance Limit Diagnosis

**Correct Answer: B**

**Why B is right:**
- ✅ Selective failure (800 of 10,000) is signature of 1 MB instance limit
- ✅ Only Fortune 500 accounts fail (they have more data) → data-size dependent
- ✅ Mid-journey ERROR status → data accumulation during execution
- ✅ Solution: Reduce API data retrieval or simplify conditions

**Why others are wrong:**
- **A)** Wrong premise. Read Audience journeys also have the 1 MB limit
- **C)** Activity count is not mentioned; selective failure pattern points to data size
- **D)** No governance issue mentioned; this is data accumulation

**Exam lesson:** Selective profile failures (some complete, some error) = 1 MB instance limit.

---

## Q4: Content Authoring - Fragments

**Correct Answer: C**

**Why C is right:**
- ✅ Logo/footer is static, reusable HTML → Visual fragment
- ✅ Greeting (firstName, pointsBalance) is simple attribute lookup → Personalization fields
- ✅ Conditional tier message (IF/THEN) → Expression fragment
- ✅ Personalized offers → Personalization fields

**Why others are wrong:**
- **A)** Fragments aren't just for A/B testing; they're for reusable content
- **B)** Misses the conditional tier message, which should be expression fragment
- **D)** Using expression fragments for simple attribute lookups is overkill

**Exam lesson:** Fields = simple data; Expression fragments = complex logic; Visual fragments = static design.

---

## Q5: Offer Decisioning - Capping Logic

**Correct Answer: B**

**Why B is right:**
- ✅ Capping is per-offer, not decision-level
- ✅ When Offer A hits cap (3/3), system skips it
- ✅ System evaluates next-ranked offer: Offer B (hasn't reached cap)
- ✅ Delivers Offer B, not fallback

**Why others are wrong:**
- **A)** Capping is monthly, not daily
- **C)** Capping doesn't fail the entire decision; it filters and moves to next
- **D)** Not "nothing." System skips capped offer and delivers next ranked

**Exam lesson:** When top-priority offer is capped → system selects next ranked uncapped offer. No fallback needed.

---

## Q6: AEP Foundations - Schema Types

**Correct Answer: B**

**Why B is right:**
- ✅ Profile Schema (Dataset 1) provides loyaltyPoints attribute
- ✅ ExperienceEvent Schema (Dataset 2) provides purchase history time-series
- ✅ Both must be profile-enabled for the condition to work
- ✅ Condition needs both: attribute lookup (loyaltyPoints) AND event query (spent $500 in 30 days)

**Why others are wrong:**
- **A)** Wrong. Both must be enabled
- **C)** Wrong. Attributes are equally important as events
- **D)** Wrong. Datasets enabled for profile work better than querying via data source for real-time needs

**Exam lesson:** Profile Schema = attributes; ExperienceEvent Schema = behaviors. Both need profile enablement for complete journey logic.

---

## Q7: Journey Types - Read Audience Concurrency

**Correct Answer: B**

**Why B is right:**
- ✅ Teams A-E (8:00-8:20 AM) = 5 concurrent instances running during 8:00-8:20 window
- ✅ Team F (8:25 AM) would be 6th concurrent instance → blocked
- ✅ Team G can be scheduled later or after earlier jobs complete

**Why others are wrong:**
- **A)** Wrong. 5-instance limit prevents Team F
- **C)** No 10-minute rule. 5-10 minute spacing is recommendation, not requirement
- **D)** Wrong. With 1-hour duration, Team G at 8:30 would be during Teams D-E window, making it 7 concurrent (exceeds limit earlier)

**Exam lesson:** 5 concurrent Read Audience instances organization-wide. Stagger 5-10 min apart to avoid concurrency issues.

---

## Q8: Guardrails - Event Payload Size

**Correct Answer: B**

**Why B is right:**
- ✅ Event payload is 80 KB total
- ✅ 64 KB limit applies to events entering journeys
- ✅ 80 KB > 64 KB → event silently dropped
- ✅ Profiles never enter journey (no log entry)

**Why others are wrong:**
- **A)** 1 MB limit is different; 64 KB is the event entry limit
- **C)** Event won't even enter; can't cause mid-journey errors if it's dropped at entry
- **D)** 64 KB limit applies to all events, unitary and business

**Exam lesson:** 64 KB = event entry limit. Event dropped silently → zero profiles enter → no log entry.

---

## Q9: Content Authoring - Content Experiment Interpretation

**Correct Answer: B**

**Why B is right:**
- ✅ Differences are marginal (5%, 5.5%, 5.3%)
- ✅ 0.5% improvement is small; CTA variable likely optimized
- ✅ Better ROI testing different variable (send time, layout, offer value)

**Why others are wrong:**
- **A)** Small differences suggest optimization plateau; test different variable
- **C)** Don't declare victory. Small improvements warrant testing new variables
- **D)** 50K sample is statistically significant; not inconclusive

**Exam lesson:** When experiment results are close (1-2% difference), test a different variable next.

---

## Q10: Journey Building - Unitary Event Reentrance

**Correct Answer: B**

**Why B is right:**
- ✅ First event at 2:01 PM triggers journey
- ✅ 5-minute reentrance block until 2:06 PM
- ✅ Second event at 2:03 PM is blocked (within 5-min window)
- ✅ Customer receives only one email

**Why others are wrong:**
- **A)** Wrong. 5-minute block applies per journey per profile
- **C)** Wrong. Block applies regardless of event details
- **D)** Wrong. No error state; block is expected behavior

**Exam lesson:** Unitary events have 5-minute reentrance block. Same profile can't trigger journey twice within 5 minutes.

---

## Q11: Offer Decisioning - Static vs. Dynamic

**Correct Answer: B**

**Why B is right:**
- ✅ Offer A: No {{variables}} → Static
- ✅ Offer B: Contains {{discountPercentage}}, {{promoCode}}, {{expirationDate}} → Dynamic
- ✅ Offer C: Contains {{planType}}, {{benefitsList}} → Dynamic

**Why others are wrong:**
- **A)** A is static, not dynamic
- **C)** Offer A is static; forcing it to be dynamic is wrong
- **D)** A is not dynamic in any scenario

**Exam lesson:** {{variables}} in offer = dynamic. No {{variables}} = static.

---

## Q12: AEP Foundations - Identity Merging

**Correct Answer: B**

**Why B is right:**
- ✅ ECID-67890 + email merge to same profile
- ✅ All pre-login behavior (product views) automatically link to authenticated profile
- ✅ Journey condition finds 10 views
- ✅ Jane is included in journey

**Why others are wrong:**
- **A)** Wrong. Anonymous behavior merges automatically on identity confirmation
- **C)** Question not about cart count; about whether views are found
- **D)** Wrong. No 24-hour sync required; merge is instant

**Exam lesson:** When identities merge, historical data accessible immediately. No separate anonymous vs. authenticated views.

---

## Q13: Guardrails & Journey Type - Multiple Issues

**Correct Answer: B**

**Why B is right:**
- ✅ Not activity count issue (44 < 50)
- ✅ Selective failure pattern (5K of 50K error) → 1 MB instance limit
- ✅ Error profiles have more historical data (10+ years) → accumulation issue
- ✅ Successful profiles have less data (<5 years) → stay under 1 MB
- ✅ Solution: Reduce profile data retrieval or simplify

**Why others are wrong:**
- **A)** Activity count is 44, under 50 limit
- **C)** Events are 20 KB; under 64 KB limit. Would affect ALL profiles at entry
- **D)** Not custom action issue (would affect all equally)

**Exam lesson:** Selective profile errors based on data volume = 1 MB instance limit.

---

## Q14: Content Authoring - Expression Fragment Channels

**Correct Answer: B**

**Why B is right:**
- ✅ Email works with expression fragments
- ✅ SMS works with expression fragments
- ✅ In-app does NOT support expression fragments → must use personalization fields
- ✅ Fragment is in Live status (required)

**Why others are wrong:**
- **A)** Wrong. Expression fragments NOT supported in in-app
- **C)** Wrong. Expression fragments work in email AND SMS
- **D)** Live status is correct; no need to change

**Exam lesson:** Expression fragments NOT in-app. Use personalization fields for in-app instead.

---

## Q15: AEP Foundations - Profile vs. Event Data

**Correct Answer: C**

**Why C is right:**
- ✅ Data 1: Attributes without timestamps → Profile Schema
- ✅ Data 2: Purchase records with dates/amounts → Event Schema (time-series)
- ✅ Data 3: Activity logs with timestamps → Event Schema (should be events)
- ✅ But Data 3 could also work as Profile (last login, last click) depending on use

**Actually, reviewing more carefully:**
- Data 3 has updateDate, lastLogin (timestamp-based activities)
- Should be from Event Schema for time-series data
- Answer should be: Data 1 only from Profile Schema

**Corrected answer: B (Data 1 only)**

---

## Q16: Journey Validation - What's Checked?

**Correct Answer: B**

**Why B is correct:**
- ✅ Validation checks that all referenced fields exist in schemas
- ✅ {{profile.attributes.customField}} referenced but doesn't exist → validation error
- ✅ This blocks publishing

**Why others are wrong:**
- **A)** Validation catches 50-activity limit at publish (error), but this isn't about syntax error
- **C)** Validation checks syntax/existence, not business logic quality
- **D)** 1.5 MB authored = soft warning (90% threshold); allows publish

**Exam lesson:** Validation checks technical correctness (fields exist, syntax valid), not business logic.

---

## Q17: Journey Building - Audience Qualification Timing

**Correct Answer: B**

**Why B is right:**
- ✅ Audience Qualification activities have up to 10-minute activation delay
- ✅ This is a known guardrail
- ✅ 10:05 AM entry + ~7 min delay = 10:12 AM email is expected behavior

**Why others are wrong:**
- **A)** Audience Qualification supports real-time (with delay); configuration is correct
- **C)** 5-minute reentrance block is for unitary events, not audience qualification
- **D)** Data syncing isn't the issue; it's the guardrail delay

**Exam lesson:** Audience Qualification has 10-minute activation delay. This is expected.

---

## Q18: Offer Decisioning - Using in Journeys

**Correct Answer: B**

**Why B is right:**
- ✅ Fallback offer shown when no personalized offers match
- ✅ 15K customers likely didn't match eligibility rules for the 10 offers
- ✅ System evaluated rules, found no matches, displayed fallback

**Why others are wrong:**
- **A)** Fallback isn't a safeguard for frequency caps; it's for no-match scenarios
- **C)** Fallback isn't randomly shown; it's shown when no offers match
- **D)** The system is working correctly; fallback offer is working as designed

**Exam lesson:** Fallback offer displays when eligibility rules don't match for any offer in collection.

---

## Q19: Guardrails - Combining Multiple Limits

**Correct Answer: B**

**Why B is right:**
- ✅ Profile 1: 640 KB < 1 MB → completes
- ✅ Profile 2: 1,215 KB > 1 MB → exceeds journey instance limit → ERROR status
- ✅ This matches selective profile failure pattern (some profiles error based on data volume)

**Why others are wrong:**
- **A)** 1,215 KB exceeds 1 MB limit
- **C)** Events are 10-15 KB; under 64 KB limit
- **D)** 2 MB is message content (email), not journey instance. 1 MB is the limit here

**Exam lesson:** 1 MB journey instance limit applies to accumulated data during execution.

---

## Q20: Journey Type Decision - Complex Scenario

**Correct Answer: C**

**Why C is right:**
- ✅ "Within 1 hour of score change" = real-time trigger needed → Unitary event
- ✅ "Score just changed to YES" = customer action/attribute change → event-driven
- ✅ Multi-step, multi-day nurture with branching → supported in unitary event
- ✅ NOT about scheduled batch → not Read Audience

**Why others are wrong:**
- **A)** Read Audience is batch (hourly run), not real-time within 1 hour
- **B)** Business event is for external systems, not attribute changes
- **D)** Audience Qualification possible, but unitary event cleaner for this use case

**Exam lesson:** Real-time customer attribute/action trigger = Unitary event.

---

# FINAL NOTES

## If You Scored:

**18-20 (90-100%):** Excellent. You're exam-ready. Trust yourself Monday.

**15-17 (75-85%):** Very good. Review the few you missed to understand the patterns.

**12-14 (60-70%):** Solid foundation. Focus on guardrail diagnostics and journey type decisions.

**Below 12 (Below 60%):** You need more review. Focus on:
- Guardrail symptom diagnosis
- Journey type selection (real-time vs. scheduled)
- Fragment vs. personalization field distinction

---

**You've got this. See you on the other side of Monday's exam! 💪**

