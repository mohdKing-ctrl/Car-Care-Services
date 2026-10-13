/* Demo accounts. Only salted SHA-256 hashes are stored here, never the passwords.
   hash = sha256(salt + ":" + password). To change a password, use the "Accounts" tab in the admin
   dashboard: it prints a new line to paste here.
   NOTE: this is a client-side demo login. A real system must check passwords on a server. */
const ACCOUNTS = [
  {
    "user": "admin",
    "role": "admin",
    "company": null,
    "name": "Administrator",
    "salt": "4ce4758ff277c9ee",
    "hash": "3f30d26f0481d37fae8f6f0547e479e7691b6a8164bb7c980da9f5ec4f1bf6b8"
  },
  {
    "user": "al-noor",
    "role": "company",
    "company": "al-noor",
    "name": "Al Noor Mobile Wash",
    "salt": "59070be15dffe55e",
    "hash": "debb2bce420c9e2e734493419cfeb3cad85c41183b62a46b302b23c0f1f19e6d"
  },
  {
    "user": "sahara",
    "role": "company",
    "company": "sahara",
    "name": "Sahara Auto Care",
    "salt": "7e51768042fc2819",
    "hash": "df8e21f1ecd6cddc952fde7fe49e80476bf0274107215088d7c89db5e93edb73"
  },
  {
    "user": "gulf-shine",
    "role": "company",
    "company": "gulf-shine",
    "name": "Gulf Shine Detailing",
    "salt": "77695c60dd0ee880",
    "hash": "d3810831db7192ff4dfdfa9ec625a0de0c4f0f2d709dde0dc12e9b2635b0ad0c"
  },
  {
    "user": "dhofar-oil",
    "role": "company",
    "company": "dhofar-oil",
    "name": "Dhofar Oil Express",
    "salt": "0d88984bba2a5c04",
    "hash": "28e4f3708f850c65fe4e3b0b06695bb428692c8614ae8c7c2e9be1834e3b2910"
  },
  {
    "user": "khareef-wash",
    "role": "company",
    "company": "khareef-wash",
    "name": "Khareef Car Wash",
    "salt": "9c3af847bc085c4c",
    "hash": "0897ae9850d3c483af63f9b5c18dffb18ba5cf36adde7d90f07a64bca8eb303d"
  },
  {
    "user": "sohar-garage",
    "role": "company",
    "company": "sohar-garage",
    "name": "Sohar Mobile Garage",
    "salt": "ba7a2c6f0ba06f66",
    "hash": "e51e4b9ee5e85694a7bcb43a8f47d26b172aa9d28fcbcb3be84f9a225ef966b5"
  },
  {
    "user": "nizwa-doctor",
    "role": "company",
    "company": "nizwa-doctor",
    "name": "Nizwa Auto Doctor",
    "salt": "6a2eb3fdcce67d44",
    "hash": "900d2eb4828f69675ae210d1862c6f41e933b2ab6ec79f7b35127b2edc8ad5d7"
  },
  {
    "user": "sur-sparkle",
    "role": "company",
    "company": "sur-sparkle",
    "name": "Sur Sparkle",
    "salt": "9cc3df248c7718c8",
    "hash": "d9afa1540686438a5254048b21c3ee2c21551b00701e8acb74c3228b42524838"
  },
  {
    "user": "barka-roadside",
    "role": "company",
    "company": "barka-roadside",
    "name": "Barka Quick Fix Roadside",
    "salt": "c2ecd09f87f79f7f",
    "hash": "c8ebf26745984d6a6c4f0e717da363f3f0c6187b1821333a1caa8449baf05cd2"
  },
  {
    "user": "buraimi-shine",
    "role": "company",
    "company": "buraimi-shine",
    "name": "Al Buraimi Shine & Service",
    "salt": "f577edfa18951a51",
    "hash": "4391869f96766808ffaa9cfdc870d5e4cadfddeca936450c0efd477e58c146bc"
  },
  {
    "user": "ibri-clinic",
    "role": "company",
    "company": "ibri-clinic",
    "name": "Ibri Car Clinic",
    "salt": "1e9cb495bb963b1e",
    "hash": "21e2e191b9d7c6d5a4edd5a6c9177654357225790086c7dcbb7323f1733d392d"
  },
  {
    "user": "khasab-care",
    "role": "company",
    "company": "khasab-care",
    "name": "Musandam Mobile Care",
    "salt": "8fb2aaeee2c0f828",
    "hash": "1f3de5eddf3737794a07dfd6fa901b450ae24010ff222b54debe8e7f0f93217f"
  },
  {
    "user": "ibra-wash",
    "role": "company",
    "company": "ibra-wash",
    "name": "Ibra Auto Wash",
    "salt": "dcc8a7cf55daeb71",
    "hash": "fdd7fb33e41988c63ffe63045d892a083ee805a99f42a442d924104896be2f07"
  },
  {
    "user": "duqm-care",
    "role": "company",
    "company": "duqm-care",
    "name": "Duqm Car Care",
    "salt": "1efb9de335e9d0d1",
    "hash": "92d99b6c2aba65838f1dbc6d3a1c72baf730325a3b88e6ab139a5766cfd1afd9"
  },
  {
    "user": "utas-campus-care",
    "role": "company",
    "company": "utas-campus-care",
    "name": "Campus Car Care (UTAS Partner)",
    "salt": "a99d8b84f319b44c",
    "hash": "1dcc28bb13387b3e1148797ec73a0c6fc52a7498bfdc37a053db0d9762a7aeb9"
  }
];
