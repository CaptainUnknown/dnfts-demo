// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import {FunctionsClient} from "@chainlink/contracts@1.2.0/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts@1.2.0/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

/// @custom:security-contact @CaptUnknown
contract NexLabs is ERC721, ERC721URIStorage, Ownable, FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;
    uint256 private _nextTokenId;

    mapping(uint256 => bytes32) public s_lastRequestId;
    mapping(uint256 => bytes) public s_lastError;
    mapping(bytes32 => uint256) private requestIdsForTokens;

    // Errors
    error UnexpectedRequestID(bytes32 requestId);

    // Events
    event Response(bytes32 indexed requestId, string character, bytes response, bytes err);

    bytes32 donID;
    uint32 callbackGasLimit;
    uint64 subscriptionId;

    // Chainlink function to request the nft changes
    string source =
    "const color = args[0];"
    "const res = await Functions.makeHttpRequest({ url: `https://dnft-serverless.vercel.app/api/update-nft?color=${color}`, timeout: 9000 });"
    "if (res.error || res.status !== 200) throw Error('Request Failed');"
    "const { data } = res;"
    "return Functions.encodeString(data.hash);";

    /**
     * @notice Initializes the contract with the Chainlink router address and sets the contract owner
     */
    constructor(address router, bytes32 _donId, uint64 _subscriptionId)
    ERC721("NexLabs", "dNXL")
    Ownable(msg.sender)
    FunctionsClient(router)
    {
        donID = _donId;
        callbackGasLimit = 300000;
        subscriptionId = _subscriptionId;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    /**
     * @notice Sends an HTTP request for character information
     * @param args The arguments to pass to the HTTP request
     * @return requestId The ID of the request
     */
    function updateNFT(
        string[] calldata args,
        uint256 tokenId
    ) external returns (bytes32 requestId) {
        require(_requireOwned(tokenId) == msg.sender);
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        if (args.length > 0) req.setArgs(args);

        bytes32 sentRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            callbackGasLimit,
            donID
        );

        requestIdsForTokens[sentRequestId] = tokenId;
        s_lastRequestId[tokenId] = sentRequestId;
        return sentRequestId;
    }

    /**
     * @notice Callback function for fulfilling a request
     * @param requestId The ID of the request to fulfill
     * @param response The HTTP response data
     * @param err Any errors from the Functions request
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        uint256 tokenId = requestIdsForTokens[requestId];
        if (s_lastRequestId[tokenId] != requestId) {
            revert UnexpectedRequestID(requestId);
        }

        string memory newURI = string(response);
        if (err.length == 0) {
            _setTokenURI(tokenId, newURI);
        } else {
            s_lastError[tokenId] = err;
        }

        emit Response(requestId, newURI, response, err);
    }

    // Necessary overrides
    function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}