// ===============================
// STEP 1 — Generate DID (Keypair)
// ===============================

// Get elements from HTML
const generateBtn = document.getElementById("generate");
const regenBtn = document.getElementById("regen");
const copyBtn = document.getElementById("copy");
const didField = document.getElementById("didField");
const publicKeyBox = document.getElementById("publicKeyBox");

// Generate DID using ECDSA P-256 keypair
async function generateDID() {
    try {
        const keyPair = await crypto.subtle.generateKey(
            { name: "ECDSA", namedCurve: "P-256" },
            true,
            ["sign", "verify"]
        );

        const publicJWK = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
        const privateJWK = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

        // Create DID from public key
        const did =
            "did:key:" + btoa(JSON.stringify(publicJWK)).substring(0, 20);

        // Show DID
        didField.value = did;

        // Show public key
        publicKeyBox.textContent = JSON.stringify(publicJWK, null, 2);

        // Save keys
        localStorage.setItem("demo_did", did);
        localStorage.setItem("demo_pub", JSON.stringify(publicJWK));
        localStorage.setItem("demo_priv", JSON.stringify(privateJWK));

        console.log("DID generated:", did);
    } catch (error) {
        console.error("Error generating DID:", error);
        alert("Error generating DID. Check console.");
    }
}

// Button actions
generateBtn.onclick = generateDID;
regenBtn.onclick = generateDID;

copyBtn.onclick = () => {
    navigator.clipboard.writeText(didField.value);
    alert("DID copied!");
};

// ===============================
// STEP 2 — CID input (manual)
// ===============================
// (No code needed; you already paste CID into HTML field)

const cidField = document.getElementById("cidField");


// ===============================
// STEP 3 — Generate Verifiable Credential (VC)
// ===============================

// Get elements
const docNameField = document.getElementById("docName");
const issuerNameField = document.getElementById("issuerName");
const generateVCBtn = document.getElementById("generateVCBtn");
const vcOutput = document.getElementById("vcOutput");

// Random hex generator for VC ID
function randomHex(len) {
    const array = new Uint8Array(len);
    crypto.getRandomValues(array);
    return Array.from(array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

// Build the VC JSON object
function buildVC(did, cid, docName, issuerName) {
    return {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        "id": "urn:uuid:" + randomHex(16),
        "type": ["VerifiableCredential", "DocumentCredential"],
        "issuer": issuerName,
        "issuanceDate": new Date().toISOString(),
        "credentialSubject": {
            "id": did,
            "documentName": docName,
            "ipfsCID": cid
        },
        "proof": null // Will be filled in Step 4
    };
}

// Handle VC generation
generateVCBtn.onclick = () => {
    const did =
        localStorage.getItem("demo_did") || document.getElementById("didField").value;

    if (!did) {
        alert("Generate DID first!");
        return;
    }

    const cid = cidField.value.trim();
    if (!cid) {
        alert("Paste your IPFS CID first!");
        return;
    }

    const docName = docNameField.value.trim();
    if (!docName) {
        alert("Enter the document name!");
        return;
    }

    const issuerName = issuerNameField.value.trim() || "My Organization";

    const vc = buildVC(did, cid, docName, issuerName);

    // Display VC
    vcOutput.textContent = JSON.stringify(vc, null, 2);

    // Save for signing
    localStorage.setItem("unsignedVC", JSON.stringify(vc));

    alert("Verifiable Credential generated!");
};


