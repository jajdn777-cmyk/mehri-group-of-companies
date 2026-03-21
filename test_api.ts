import { api } from './utils.ts';

console.log("Mock test for api call logic");
async function test() {
    console.log("Testing API existence...");
    if (typeof api === 'function') {
        console.log("API function is available.");
    } else {
        console.error("API function is NOT available.");
        process.exit(1);
    }
}
test();
