
import bootstrap from "./app.bootstrap.js";
import { generateEncryption } from "./common/utils/Security/encryption.security.js";
import { decryptData } from "./common/utils/Security/encryption.security.js";
bootstrap();
// const test = await generateEncryption("01012345678");
// console.log(test);

// const decrypted = decryptData(JSON.stringify(test));
// console.log(decrypted);
