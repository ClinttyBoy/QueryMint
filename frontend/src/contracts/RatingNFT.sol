// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ServiceRatingNFT is ERC721URIStorage, Ownable {
    uint256 public tokenIdCounter;

    struct ServiceRating {
        uint8 rating; // 1 = bronze, 2 = silver, 3 = gold
        address rater;
        string serviceId;
        uint256 timestamp;
    }

    mapping(uint256 => ServiceRating) public ratings;

    event ServiceRated(
        uint256 indexed tokenId,
        address indexed rater,
        string serviceId,
        uint8 rating,
        uint256 timestamp
    );

    constructor() ERC721("QueryMint Rating NFT", "QMNFT") Ownable(msg.sender) {}

    function mintRatingNFT(
        address to,
        uint8 rating,
        string memory serviceId,
        string memory tokenURI
    ) external returns (uint256) {
        require(rating >= 1 && rating <= 5, "Rating must be 1-5");

        uint256 tokenId = tokenIdCounter;
        tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        ratings[tokenId] = ServiceRating({
            rating: rating,
            rater: msg.sender,
            serviceId: serviceId,
            timestamp: block.timestamp
        });

        emit ServiceRated(
            tokenId,
            msg.sender,
            serviceId,
            rating,
            block.timestamp
        );
        return tokenId;
    }

    function getRating(uint256 tokenId)
        external
        view
        returns (ServiceRating memory)
    {
        return ratings[tokenId];
    }
}
