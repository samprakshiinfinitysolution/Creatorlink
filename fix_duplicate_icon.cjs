const fs = require("fs");
const path = "frontend/components/creator/profile/CreatorProfile.jsx";
let content = fs.readFileSync(path, "utf8");

const duplicate = `function CheckBadgeIcon({ className = "w-5 h-5 text-secondary" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}`;

const normalized = content.replace(/\r\n/g, "\n");
if (normalized.includes(duplicate)) {
    const updated = normalized.replace(duplicate + "\n\n", "");
    fs.writeFileSync(path, updated, "utf8");
    console.log("SUCCESS: Duplicate CheckBadgeIcon removed!");
} else {
    console.log("NOT FOUND!");
}

