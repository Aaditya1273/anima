// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @notice Minimal FHE-compatible ERC-7984 test double.
///         Stores euint64 balances and accepts encrypted transfer/transferFrom calls.
///         Supports mintClear (plaintext mint) and approveEncrypted for testing.
contract MockFHERC20 is ZamaEthereumConfig {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;

    mapping(address => euint64) private _balances;
    mapping(address => mapping(address => bool)) private _approved;

    event Transfer(address indexed from, address indexed to);
    event Approval(address indexed owner, address indexed spender);

    constructor(string memory name_, string memory symbol_) {
        name = name_;
        symbol = symbol_;
    }

    /// @notice Mint plaintext tokens (for test setup — not confidential).
    ///         Converts to trivial euint64 so tests can fund accounts.
    function mintClear(address to, uint256 amount) external {
        _balances[to] = FHE.add(_balances[to], FHE.asEuint64(uint64(amount)));
        FHE.allowThis(_balances[to]);
        FHE.allow(_balances[to], to);
    }

    /// @notice Approve spender for encrypted transfers.
    function approveEncrypted(address spender) external {
        _approved[msg.sender][spender] = true;
        emit Approval(msg.sender, spender);
    }

    /// @notice Encrypted transferFrom — pulls tokens from `from` to `to`.
    function transferFrom(
        address from,
        address to,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external returns (bool) {
        require(_approved[from][msg.sender], "MockFHERC20: not approved");
        euint64 amount = FHE.fromExternal(encAmount, proof);

        ebool canTransfer = FHE.le(amount, _balances[from]);
        _balances[from] = FHE.select(
            canTransfer,
            FHE.sub(_balances[from], amount),
            _balances[from]
        );
        FHE.allowThis(_balances[from]);
        FHE.allow(_balances[from], from);

        _balances[to] = FHE.add(_balances[to], FHE.select(
            canTransfer,
            amount,
            FHE.asEuint64(uint64(0))
        ));
        FHE.allowThis(_balances[to]);
        FHE.allow(_balances[to], to);

        emit Transfer(from, to);
        return true;
    }

    /// @notice Encrypted transfer — moves tokens from caller to `to`.
    function transfer(
        address to,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external returns (bool) {
        euint64 amount = FHE.fromExternal(encAmount, proof);

        ebool canTransfer = FHE.le(amount, _balances[msg.sender]);
        _balances[msg.sender] = FHE.select(
            canTransfer,
            FHE.sub(_balances[msg.sender], amount),
            _balances[msg.sender]
        );
        FHE.allowThis(_balances[msg.sender]);
        FHE.allow(_balances[msg.sender], msg.sender);

        _balances[to] = FHE.add(_balances[to], FHE.select(
            canTransfer,
            amount,
            FHE.asEuint64(uint64(0))
        ));
        FHE.allowThis(_balances[to]);
        FHE.allow(_balances[to], to);

        emit Transfer(msg.sender, to);
        return true;
    }

    /// @notice Returns encrypted balance handle.
    function balanceOf(address account) external view returns (euint64) {
        return _balances[account];
    }

    /// @notice Returns encrypted allowance (simplified — stored zero handle).
    ///         Cannot be view because FHE.asEuint64 modifies FHEVM state.
    function allowance(address, address) external returns (euint64) {
        return FHE.asEuint64(uint64(0));
    }
}
