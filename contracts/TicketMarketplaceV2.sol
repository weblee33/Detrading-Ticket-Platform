// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/// @title TicketMarketplaceV2
/// @notice Reproducible v2 contract for the demo. This is not claimed to be the lost original contract.
contract TicketMarketplaceV2 is ERC1155Supply, ERC1155Holder, Ownable, ReentrancyGuard {
    using MessageHashUtils for bytes32;

    struct TicketInfo {
        string eventName;
        string eventDate;
        string ticketType;
        string metadataURI;
    }

    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 amount;
        uint256 pricePerItem;
    }

    error EmptyField();
    error InvalidAmount();
    error InvalidPrice();
    error InvalidRecipient();
    error TicketNotFound();
    error InsufficientTicketBalance();
    error MarketplaceNotApproved();
    error ListingNotFound();
    error NotListingSeller();
    error IncorrectPayment(uint256 expected, uint256 received);
    error SellerPaymentFailed();
    error NotGateStaff();
    error PassExpired();
    error PassDeadlineTooFar();
    error PassAlreadyUsed();
    error InvalidPassSignature();

    uint256 public nextTokenId = 1;
    uint256 public nextListingId = 1;

    mapping(uint256 => TicketInfo) public ticketInfos;
    mapping(uint256 => Listing) public listings;
    mapping(address => bool) public gateStaff;
    mapping(bytes32 => bool) public usedPasses;

    bytes32 public constant REDEEM_TYPEHASH = keccak256(
        "TicketAdmission(address contractAddress,uint256 chainId,address holder,uint256 tokenId,bytes32 nonce,uint256 deadline)"
    );
    uint256 public constant MAX_PASS_VALIDITY = 10 minutes;

    event TicketCreated(
        uint256 indexed tokenId,
        string eventName,
        string eventDate,
        string ticketType,
        string metadataURI
    );
    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 pricePerItem
    );
    event Sale(uint256 indexed listingId, address indexed buyer, uint256 amount);
    event Cancelled(uint256 indexed listingId);
    event GateStaffUpdated(address indexed account, bool allowed);
    event TicketRedeemed(
        bytes32 indexed passId,
        uint256 indexed tokenId,
        address indexed holder,
        address operator
    );

    constructor() ERC1155("") Ownable(msg.sender) {
        gateStaff[msg.sender] = true;
        emit GateStaffUpdated(msg.sender, true);
    }

    modifier onlyGateStaff() {
        if (!gateStaff[msg.sender]) revert NotGateStaff();
        _;
    }

    function createTicketTypeAndMint(
        string calldata eventName,
        string calldata eventDate,
        string calldata ticketType,
        string calldata metadataURI,
        uint256 amount,
        address to
    ) external onlyOwner {
        if (
            bytes(eventName).length == 0 ||
            bytes(eventDate).length == 0 ||
            bytes(ticketType).length == 0 ||
            bytes(metadataURI).length == 0
        ) revert EmptyField();
        if (amount == 0) revert InvalidAmount();
        if (to == address(0)) revert InvalidRecipient();

        uint256 tokenId = nextTokenId++;
        ticketInfos[tokenId] = TicketInfo(eventName, eventDate, ticketType, metadataURI);
        _mint(to, tokenId, amount, "");

        emit TicketCreated(tokenId, eventName, eventDate, ticketType, metadataURI);
        emit URI(metadataURI, tokenId);
    }

    /// @notice Escrows tickets in this contract so a listing cannot become unfunded later.
    function createListing(uint256 tokenId, uint256 amount, uint256 pricePerItem) external nonReentrant {
        if (!exists(tokenId)) revert TicketNotFound();
        if (amount == 0) revert InvalidAmount();
        if (pricePerItem == 0) revert InvalidPrice();
        if (balanceOf(msg.sender, tokenId) < amount) revert InsufficientTicketBalance();
        if (!isApprovedForAll(msg.sender, address(this))) revert MarketplaceNotApproved();

        uint256 listingId = nextListingId++;
        listings[listingId] = Listing(msg.sender, tokenId, amount, pricePerItem);
        _safeTransferFrom(msg.sender, address(this), tokenId, amount, "");

        emit Listed(listingId, msg.sender, tokenId, amount, pricePerItem);
    }

    function buy(uint256 listingId, uint256 buyAmount) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        if (listing.seller == address(0)) revert ListingNotFound();
        if (buyAmount == 0 || buyAmount > listing.amount) revert InvalidAmount();

        uint256 totalPrice = buyAmount * listing.pricePerItem;
        if (msg.value != totalPrice) revert IncorrectPayment(totalPrice, msg.value);

        address seller = listing.seller;
        uint256 tokenId = listing.tokenId;
        listing.amount -= buyAmount;
        if (listing.amount == 0) delete listings[listingId];

        _safeTransferFrom(address(this), msg.sender, tokenId, buyAmount, "");
        (bool paid, ) = payable(seller).call{value: totalPrice}("");
        if (!paid) revert SellerPaymentFailed();

        emit Sale(listingId, msg.sender, buyAmount);
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        Listing memory listing = listings[listingId];
        if (listing.seller == address(0)) revert ListingNotFound();
        if (listing.seller != msg.sender) revert NotListingSeller();

        delete listings[listingId];
        _safeTransferFrom(address(this), listing.seller, listing.tokenId, listing.amount, "");

        emit Cancelled(listingId);
    }

    function setGateStaff(address account, bool allowed) external onlyOwner {
        if (account == address(0)) revert InvalidRecipient();
        gateStaff[account] = allowed;
        emit GateStaffUpdated(account, allowed);
    }

    function getRedemptionDigest(
        address holder,
        uint256 tokenId,
        bytes32 nonce,
        uint256 deadline
    ) public view returns (bytes32) {
        return keccak256(abi.encode(
            REDEEM_TYPEHASH,
            address(this),
            block.chainid,
            holder,
            tokenId,
            nonce,
            deadline
        ));
    }

    /// @notice Redeems exactly one ERC-1155 ticket after verifying the holder's short-lived signed pass.
    function redeemTicket(
        address holder,
        uint256 tokenId,
        bytes32 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external onlyGateStaff nonReentrant {
        if (block.timestamp > deadline) revert PassExpired();
        if (deadline > block.timestamp + MAX_PASS_VALIDITY) revert PassDeadlineTooFar();
        bytes32 passId = getRedemptionDigest(holder, tokenId, nonce, deadline);
        if (usedPasses[passId]) revert PassAlreadyUsed();
        if (!exists(tokenId) || balanceOf(holder, tokenId) == 0) revert InsufficientTicketBalance();
        if (ECDSA.recover(passId.toEthSignedMessageHash(), signature) != holder) revert InvalidPassSignature();

        usedPasses[passId] = true;
        _burn(holder, tokenId, 1);
        emit TicketRedeemed(passId, tokenId, holder, msg.sender);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        if (!exists(tokenId)) revert TicketNotFound();
        return ticketInfos[tokenId].metadataURI;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, ERC1155Holder)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }
}
