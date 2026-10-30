/* Two sample submissions from the test account (Rosa, user 2), so Felipe's
 * panel has something to review in the demo. The same two go into the
 * database through scripts/make-seed.mjs. */
export const SAMPLE_SUBMISSIONS = [
  {
    id: 1,
    user_id: 2,
    kind: "video",
    title: "The night market from the cathedral steps",
    description: "I filmed the band and the tamale carts on Saturday. Six minutes, filmed with my phone.",
    link: null,
    file_name: "mercado-nocturno.mp4",
    status: "pending",
    felipe_note: null,
    days_ago: 1,
  },
  {
    id: 2,
    user_id: 2,
    kind: "news",
    title: "The library in Delicias is opening on Sundays",
    description: "Starting next month, with story time for kids at 11.",
    link: "https://example.com/biblioteca-delicias",
    file_name: null,
    status: "approved",
    felipe_note: "Thank you, Rosa. I'll share it this week with a few words.",
    days_ago: 4,
  },
];
