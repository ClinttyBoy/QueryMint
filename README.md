#  QueryMint: Plug-and-Play AI Powered Web3 based Chat Support Service

Demo : https://youtu.be/HIqSP9R77uU

Walkthrough : https://query-mint.vercel.app/


### The problem Querymint solves

Customer support is often expensive, unreliable, or hard to set up for website owners, especially when trying to personalize answers based on their unique data. Existing chatbot solutions don’t offer:

-   Easy integration with your own website
-   Custom AI model selection
-   Pay-as-you-go pricing and NFT Subsription Model
-   Decentralized and programmable payments

****Querymint**** solves this problem by providing a plug-and-play AI support system where users can upload their own data and pay only when customers ask questions using microtransactions in Crypto or a **NFT based Subscription model**. This makes smart, personalized support affordable and easy to use. Under the hood, AI RAG (Retrieval-Augmented Generation) is used to ensure that responses are accurate and based on the user’s uploaded content.

![image](https://github.com/ClinttyBoy/QueryMint/blob/66029fe219ad4031883627e5e537be4f52c3ebb2/frontend/src/assets/3.png)
Users can:

-   Upload reference data for tailored responses
-   Choose their preferred AI model (ChatGPT, Claude, Gemini, etc.)
-   Embed a smart chatbot into their website instantly
-   Use microtransactions in Crypto to pay only when customer queries occur------

### 💸 Powered by Smart Wallet Infrastructure

QueryMint uses the **Biconomy Smart Account SDK** to provision a wallet for every user. This wallet can be topped up with ETH and is used to:

-   Track balances
-   Handle seamless top-ups and withdrawals
-   Automatically fund chat queries when triggered

Every time a customer sends a message through the chat, QueryMint’s **Payment Mediator** processes the transaction and pays the AI model in real-time — via the **Morph Holesky chain** — directly from the user’s wallet.

----------

###  New: **Ratings + NFT-Based Reputation System**
After each support session, customers can **rate their experience**. This rating:
-   Is stored onchain
-   **Mints an NFT** representing that support interaction
-   Gets added to the service provider’s **onchain reputation portfolio**
  
   ----------
### Indexing with Goldsky

**Goldsky** is used for **NFT indexing and blockchain data tracking**, enabling fast and reliable retrieval of all onchain ratings and minted assets.
