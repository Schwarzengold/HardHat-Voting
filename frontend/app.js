const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "addCandidate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "getCandidateDetails",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCandidateList",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWinner",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetElection",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

let web3;
let contract;
let accounts;

async function connectWeb3() {
  if (window.ethereum) {
    try {
      web3 = new Web3(window.ethereum);
      accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("✅ MetaMask connected:", accounts[0]);

      window.ethereum.on('accountsChanged', (newAccounts) => {
        accounts = newAccounts;
        console.log("✅ Accounts changed:", accounts);
      });

      contract = new web3.eth.Contract(contractABI, contractAddress);
      console.log("✅ Contract loaded:", contract);

      loadCandidates();
    } catch (error) {
      console.error("❌ Web3 connection error:", error);
      showToast("Failed to connect to MetaMask!", "danger");
    }
  } else {
    alert("Please install MetaMask!");
  }
}

async function addCandidate() {
  const name = document.getElementById("candidateName").value.trim();
  if (!name) return showToast("Please enter a candidate name!", "warning");

  try {
    await contract.methods.addCandidate(name).send({
      from: accounts[0],
      value: web3.utils.toWei("0.01", "ether")
    });
    showToast(`Candidate ${name} added!`, "success");
    loadCandidates();
  } catch (error) {
    console.error("❌ Error adding candidate:", error.message);
    showToast("Failed to add candidate: " + error.message, "danger");
  }
  
}

async function loadCandidates() {
  try {
    const candidates = await contract.methods.getCandidateList().call();
    const selectList = document.getElementById("candidatesList");
    const outputContainer = document.getElementById("candidatesOutput");

    selectList.innerHTML = "";
    outputContainer.innerHTML = "<h3>Candidate List</h3>";

    if (candidates.length === 0) {
      outputContainer.innerHTML += "<p>No candidates available</p>";
      return;
    }

    for (const candidateName of candidates) {
      const option = document.createElement("option");
      option.value = candidateName;
      option.textContent = candidateName;
      selectList.appendChild(option);


      const details = await contract.methods.getCandidateDetails(candidateName).call();
      const candidateCard = document.createElement("div");
      candidateCard.className = "candidate-card";
      candidateCard.innerHTML = `<strong>${details[0]}</strong> - Votes: ${details[1]}`;
      outputContainer.appendChild(candidateCard);
    }
  } catch (error) {
    console.error("❌ Error loading candidates:", error);
    showToast("Error loading candidates", "danger");
  }
}

async function vote() {
  const candidate = document.getElementById("candidatesList").value;
  if (!candidate) return showToast("Please select a candidate!", "warning");

  try {
    await contract.methods.vote(candidate).send({ from: accounts[0] });
    showToast(`You voted for ${candidate}!`, "success");
    loadCandidates();
  } catch (error) {
    console.error("❌ Error voting:", error);
    showToast("Voting failed!", "danger");
  }
}

async function getWinner() {
  try {
    const winner = await contract.methods.getWinner().call({ from: accounts[0] });
    const voteSection = document.getElementById("voteSection");
    if (voteSection) {
      voteSection.style.display = "none";
    }
    showWinnerModal(`Winner: ${winner}`);
  } catch (error) {
    console.error("❌ Error getting winner:", error);
    showToast("Failed to get the winner!", "danger");
  }
}

async function resetElection() {
  try {
    await contract.methods.resetElection().send({ from: accounts[0] });
    showToast("Election has been reset!", "success");
    const voteSection = document.getElementById("voteSection");
    if (voteSection) {
      voteSection.style.display = "block";
    }
    loadCandidates();
  } catch (error) {
    console.error("❌ Error resetting election:", error);
    showToast("Failed to reset election", "danger");
  }
}

function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  const textColor = type === "warning" ? "text-dark" : "text-white";

  toast.className = `toast align-items-center ${textColor} bg-${type} border-0 show`;
  toast.role = "alert";
  toast.style.minWidth = "300px";
  toast.style.maxWidth = "400px";
  toast.style.padding = "15px";
  toast.style.marginBottom = "10px";

  toast.innerHTML = `
      <div class="d-flex">
          <div class="toast-body">${message}</div>
          <button type="button" class="btn-close ${type === "warning" ? "btn-close-dark" : ""} me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
  `;

  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showWinnerModal(message) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "1200";

  const modal = document.createElement("div");
  modal.style.backgroundColor = "#fff";
  modal.style.borderRadius = "10px";
  modal.style.padding = "40px";
  modal.style.textAlign = "center";
  modal.style.maxWidth = "500px";
  modal.style.width = "90%";
  modal.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.3)";

  const modalText = document.createElement("h2");
  modalText.textContent = message;
  modalText.style.marginBottom = "30px";
  modalText.style.color = "#333";

  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.style.padding = "12px 24px";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "5px";
  closeButton.style.backgroundColor = "#007bff";
  closeButton.style.color = "#fff";
  closeButton.style.cursor = "pointer";
  closeButton.onclick = () => {
    document.body.removeChild(overlay);
  };

  modal.appendChild(modalText);
  modal.appendChild(closeButton);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

window.addEventListener("load", connectWeb3);
