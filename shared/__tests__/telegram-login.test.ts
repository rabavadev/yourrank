// Test for Telegram login widget verification
// This test validates that the check-string construction handles optional fields correctly

interface TgLogin {
  id: number; 
  first_name?: string; 
  last_name?: string; 
  username?: string;
  photo_url?: string; 
  auth_date: number; 
  hash: string;
}

// Simulate the check-string construction logic from verifyTelegramLogin
function buildCheckString(data: TgLogin): string {
  const { hash, ...fields } = data;
  return Object.keys(fields).sort()
    .filter((k) => (fields as any)[k] != null) // Check for null or undefined
    .map((k) => `${k}=${(fields as any)[k]}`).join("\n");
}

// Test cases for different field combinations
const testCases = [
  {
    name: "All fields present",
    data: {
      id: 123456789,
      first_name: "John",
      last_name: "Doe",
      username: "john_doe",
      photo_url: "https://example.com/photo.jpg",
      auth_date: 1234567890,
      hash: "ignored"
    } as TgLogin,
    expectedFields: ["auth_date", "first_name", "id", "last_name", "photo_url", "username"]
  },
  {
    name: "Minimal fields (only required)",
    data: {
      id: 123456789,
      auth_date: 1234567890,
      hash: "ignored"
    } as TgLogin,
    expectedFields: ["auth_date", "id"]
  },
  {
    name: "Partial optional fields",
    data: {
      id: 123456789,
      first_name: "John",
      username: "john_doe",
      auth_date: 1234567890,
      hash: "ignored"
    } as TgLogin,
    expectedFields: ["auth_date", "first_name", "id", "username"]
  },
  {
    name: "Optional fields are null",
    data: {
      id: 123456789,
      first_name: "John",
      last_name: null,
      username: null,
      photo_url: null,
      auth_date: 1234567890,
      hash: "ignored"
    } as TgLogin,
    expectedFields: ["auth_date", "first_name", "id"]
  }
];

function runTests() {
  console.log("Running Telegram login check-string construction tests...\n");
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    try {
      const checkString = buildCheckString(testCase.data);
      const includedFields = checkString.split("\n").map((line) => line.split("=")[0]);
      
      // Check that expected fields are included
      const missingFields = testCase.expectedFields.filter(f => !includedFields.includes(f));
      const extraFields = includedFields.filter(f => !testCase.expectedFields.includes(f));
      
      if (missingFields.length > 0 || extraFields.length > 0) {
        console.error(`✗ ${testCase.name} failed`);
        if (missingFields.length > 0) console.error(`  Missing fields: ${missingFields.join(", ")}`);
        if (extraFields.length > 0) console.error(`  Extra fields: ${extraFields.join(", ")}`);
        console.error(`  Check string: ${checkString}`);
        failed++;
      } else {
        console.log(`✓ ${testCase.name} passed`);
        console.log(`  Check string: ${checkString}`);
        passed++;
      }
    } catch (e) {
      console.error(`✗ ${testCase.name} failed with error:`, e);
      failed++;
    }
  }
  
  console.log(`\nTest results: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Run the tests if this file is executed directly
if (typeof Bun !== 'undefined') {
  runTests();
} else if (typeof process !== 'undefined' && require.main === module) {
  runTests();
}
