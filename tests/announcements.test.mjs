import test from "node:test";
import assert from "node:assert/strict";
import {
  isCurrent,
  isPublished,
  registrationOpen,
  ontarioToday,
  announcementOrder,
} from "../src/lib/announcements.mjs";
const item = {
  published: "2026-08-01",
  active: true,
  featured: false,
  eventStart: "2026-08-27",
  eventEnd: "2026-08-30",
  registrationUrl: "https://example.org/register",
  registrationDeadline: "2026-08-20",
};
test("past events archive automatically at the Ontario day boundary", () => {
  assert.equal(isCurrent(item, "2026-08-30"), true);
  assert.equal(isCurrent(item, "2026-08-31"), false);
});
test("registration closes without hiding the forthcoming event", () => {
  assert.equal(registrationOpen(item, "2026-08-20"), true);
  assert.equal(registrationOpen(item, "2026-08-21"), false);
  assert.equal(isCurrent(item, "2026-08-21"), true);
});
test("inactive and future-dated notices never appear as current", () => {
  assert.equal(isCurrent({ ...item, active: false }, "2026-08-10"), false);
  assert.equal(isCurrent(item, "2026-07-31"), false);
  assert.equal(isPublished(item, "2026-07-31"), false);
});
test("notice expiry and one-day events are inclusive", () => {
  assert.equal(
    isCurrent(
      { ...item, eventStart: "", eventEnd: "", expires: "2026-08-20" },
      "2026-08-21",
    ),
    false,
  );
  assert.equal(isCurrent({ ...item, eventEnd: "" }, "2026-08-28"), false);
});
test("Toronto day calculation handles daylight saving and UTC midnight", () => {
  assert.equal(ontarioToday(new Date("2026-08-31T02:00:00Z")), "2026-08-30");
  assert.equal(ontarioToday(new Date("2026-01-01T04:59:00Z")), "2025-12-31");
});
test("featured notices precede others, then newest first", () => {
  const rows = [
    { data: { featured: false, published: "2026-09-10" } },
    { data: { featured: true, published: "2026-08-01" } },
    { data: { featured: true, published: "2026-09-01" } },
  ];
  assert.equal(rows.sort(announcementOrder)[0].data.published, "2026-09-01");
});
