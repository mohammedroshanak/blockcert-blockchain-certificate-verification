// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BlockCert - Blockchain Based Certificate Verification System
 * @dev Store, verify, and revoke cryptographic SHA-256 hashes of academic certificates on-chain
 */
contract BlockCert {
    
    // Structure of a certificate audit record
    struct CertificateRecord {
        string ipfsHash;      // IPFS Content Identifier (CID) of the PDF/metadata
        string sha256Hash;    // Calculated SHA-256 hash of the academic fields
        uint256 timestamp;    // Block timestamp of insertion
        address issuedBy;     // Wallet address of the issuing administrator
    }

    // Owner of the smart contract (typically the University authority)
    address public universityAuthority;

    // Mapping from Certificate Registry ID to its On-Chain Record
    mapping(string => CertificateRecord) private certificates;

    // List of registered Certificate IDs (for indexing/explorer simulation)
    string[] private registeredIds;

    // Mapping from Certificate ID to revocation status
    mapping(string => bool) public revokedCertificates;

    // Events for real-time dapp triggers
    event CertificateRegistered(
        string indexed certificateId, 
        string ipfsHash, 
        string sha256Hash, 
        address indexed authority
    );

    event CertificateRevoked(
        string indexed certificateId,
        address indexed authority
    );

    // Modifier to restrict access to the University authority
    modifier onlyAuthority() {
        require(msg.sender == universityAuthority, "BlockCert Error: Caller is not authorized authority");
        _;
    }

    constructor() {
        universityAuthority = msg.sender;
    }

    /**
     * @notice Store a certificate's cryptographic hash and IPFS metadata CID on the blockchain
     * @param certId The unique academic register ID of the certificate (e.g. BC-2026-1001)
     * @param ipfsHash The IPFS CID linking to the stored PDF file
     * @param sha256Hash The SHA-256 digital fingerprint calculated from core academic data
     */
    function storeCertificateHash(
        string calldata certId,
        string calldata ipfsHash,
        string calldata sha256Hash
    ) external onlyAuthority {
        // Assert that the certificate has not been previously registered
        require(
            bytes(certificates[certId].sha256Hash).length == 0,
            "BlockCert Error: Certificate hash already registered on-chain"
        );
        require(bytes(certId).length > 0, "BlockCert Error: Invalid Certificate ID");
        require(bytes(sha256Hash).length == 64, "BlockCert Error: Invalid SHA-256 hash length");

        certificates[certId] = CertificateRecord({
            ipfsHash: ipfsHash,
            sha256Hash: sha256Hash,
            timestamp: block.timestamp,
            issuedBy: msg.sender
        });

        registeredIds.push(certId);

        emit CertificateRegistered(certId, ipfsHash, sha256Hash, msg.sender);
    }

    /**
     * @notice Revoke a previously registered certificate
     * @param certId The unique Certificate ID to be revoked
     */
    function revokeCertificate(string calldata certId) external onlyAuthority {
        require(
            bytes(certificates[certId].sha256Hash).length > 0,
            "BlockCert Error: Certificate does not exist"
        );
        require(
            !revokedCertificates[certId],
            "BlockCert Error: Certificate is already revoked"
        );

        revokedCertificates[certId] = true;

        emit CertificateRevoked(certId, msg.sender);
    }

    /**
     * @notice Check if a certificate has been revoked
     * @param certId The unique Certificate ID
     * @return bool True if revoked, false otherwise
     */
    function isCertificateRevoked(string calldata certId) external view returns (bool) {
        return revokedCertificates[certId];
    }

    /**
     * @notice Verify a certificate's hash against the on-chain blockchain records
     * @param certId The unique Certificate ID
     * @param sha256Hash The hash computed from the document to be checked
     * @return bool True if the hash matches the on-chain value and is not revoked, False otherwise
     */
    function verifyCertificateHash(
        string calldata certId,
        string calldata sha256Hash
    ) external view returns (bool) {
        // If the certificate is revoked, it immediately fails verification
        if (revokedCertificates[certId]) {
            return false;
        }

        string memory recordedHash = certificates[certId].sha256Hash;
        
        if (bytes(recordedHash).length == 0) {
            return false;
        }
        
        // Return true if hashes are identical (bitwise equal)
        return keccak256(abi.encodePacked(recordedHash)) == keccak256(abi.encodePacked(sha256Hash));
    }

    /**
     * @notice Retrieve certificate data stored on-chain
     * @param certId The unique Certificate ID
     * @return ipfsHash The IPFS CID metadata link
     * @return sha256Hash The registered SHA-256 hash
     * @return timestamp The block timestamp of registration
     * @return issuedBy The wallet address that submitted the transaction
     */
    function getCertificateData(
        string calldata certId
    ) external view returns (
        string memory ipfsHash,
        string memory sha256Hash,
        uint256 timestamp,
        address issuedBy
    ) {
        CertificateRecord memory record = certificates[certId];
        require(bytes(record.sha256Hash).length > 0, "BlockCert Error: Certificate does not exist");
        return (record.ipfsHash, record.sha256Hash, record.timestamp, record.issuedBy);
    }

    /**
     * @notice Get total number of certificates registered on the blockchain contract
     */
    function getCertificatesCount() external view returns (uint256) {
        return registeredIds.length;
    }
}
