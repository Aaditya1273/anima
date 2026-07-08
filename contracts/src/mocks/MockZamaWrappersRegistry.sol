// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Mock of the official Zama Wrappers Registry on Sepolia.
///         Used by AnimaRegistryRouter tests to simulate the real registry.
///         Supports registering pairs and lookups by id/ERC-20/ERC-7984.
contract MockZamaWrappersRegistry {
    struct Pair {
        address erc20;
        address erc7984;
        string name;
        string symbol;
        uint8 decimals;
    }

    Pair[] private _pairs;
    mapping(address => uint256) private _erc20ToIndex;
    mapping(address => uint256) private _erc7984ToIndex;

    event PairRegistered(
        uint256 indexed id,
        address indexed erc20,
        address indexed erc7984
    );

    /// @notice Register a new ERC-20 ↔ ERC-7984 pair.
    function registerPair(
        address erc20,
        address erc7984,
        string calldata name,
        string calldata symbol,
        uint8 decimals
    ) external {
        _pairs.push(Pair({
            erc20: erc20,
            erc7984: erc7984,
            name: name,
            symbol: symbol,
            decimals: decimals
        }));
        uint256 id = _pairs.length - 1;
        _erc20ToIndex[erc20] = id;
        _erc7984ToIndex[erc7984] = id;
        emit PairRegistered(id, erc20, erc7984);
    }

    /// @notice Return the total number of registered pairs.
    function pairCount() external view returns (uint256) {
        return _pairs.length;
    }

    /// @notice Return the pair at the given index.
    function pairs(uint256 id) external view returns (Pair memory) {
        require(id < _pairs.length, "MockRegistry: invalid pair id");
        return _pairs[id];
    }

    /// @notice Look up a pair by its underlying ERC-20 address.
    function getPairByERC20(address erc20) external view returns (Pair memory) {
        uint256 id = _erc20ToIndex[erc20];
        require(_pairs[id].erc20 == erc20, "MockRegistry: ERC-20 not found");
        return _pairs[id];
    }

    /// @notice Look up a pair by its ERC-7984 wrapper address.
    function getPairByERC7984(address erc7984) external view returns (Pair memory) {
        uint256 id = _erc7984ToIndex[erc7984];
        require(_pairs[id].erc7984 == erc7984, "MockRegistry: ERC-7984 not found");
        return _pairs[id];
    }
}
