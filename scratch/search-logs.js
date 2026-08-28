import fs from 'fs';
import readline from 'readline';

async function main() {
  const fileStream = fs.createReadStream('C:\\Users\\MSI\\.gemini\\antigravity\\brain\\24a88bf9-e8fc-45c3-b4ca-de83b26c3c7b\\.system_generated\\logs\\transcript.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log('Searching logs...');
  for await (const line of rl) {
    if (line.includes('DATABASE_URL') || line.includes('.env.local')) {
      const parsed = JSON.parse(line);
      console.log(`Step ${parsed.step_index} (${parsed.type}):`);
      // Print first 200 chars of content
      console.log(parsed.content ? parsed.content.substring(0, 300) : '[No text content]');
      if (parsed.tool_calls) {
        console.log('Tool calls:', JSON.stringify(parsed.tool_calls).substring(0, 300));
      }
      console.log('-------------------');
    }
  }
}

main().catch(console.error);
