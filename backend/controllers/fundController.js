import Fund from "../models/Fund.js";
import WithdrawalHistory from "../models/WithdrawalHistory.js";

// ── GET /api/funds/:userId ────────────────────────────────────────────────────
export const getFunds = async (req, res) => {
  try {
    const { userId } = req.params;
    const equity = await Fund.findOne({ where: { user_id: userId, segment: "equity" } });
    const commodity = await Fund.findOne({ where: { user_id: userId, segment: "commodity" } });
    return res.status(200).json({ success: true, data: { equity, commodity } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/funds/add ───────────────────────────────────────────────────────
export const addFunds = async (req, res) => {
  try {
    const { user_id, segment = "equity", amount, payment_mode, bank_account, upi_id } = req.body;

    if (!user_id || !amount || amount <= 0)
      return res.status(400).json({ success: false, message: "user_id and valid amount are required" });

    let fund = await Fund.findOne({ where: { user_id, segment } });

    if (!fund) {
      fund = await Fund.create({
        user_id, segment,
        available_margin: amount, available_cash: amount,
        opening_balance: amount, payin: amount,
        withdrawable_balance: amount,
        payment_mode, bank_account, upi_id,
      });
    } else {
      await fund.update({
        available_margin:    parseFloat(fund.available_margin)    + parseFloat(amount),
        available_cash:      parseFloat(fund.available_cash)      + parseFloat(amount),
        payin:               parseFloat(fund.payin)               + parseFloat(amount),
        withdrawable_balance:parseFloat(fund.withdrawable_balance)+ parseFloat(amount),
        payment_mode, bank_account, upi_id,
      });
    }

    return res.status(200).json({ success: true, message: "Funds added successfully", data: fund });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/funds/withdraw ──────────────────────────────────────────────────
export const withdrawFunds = async (req, res) => {
  try {
    const { user_id, segment = "equity", amount, withdrawal_type = "regular", bank_account } = req.body;

    if (!user_id || !amount || amount <= 0)
      return res.status(400).json({ success: false, message: "user_id and valid amount are required" });

    const fund = await Fund.findOne({ where: { user_id, segment } });
    if (!fund)
      return res.status(404).json({ success: false, message: "Fund record not found" });

    const withdrawable = parseFloat(fund.withdrawable_balance);

    // ── Insufficient balance → FAILED history ────────────────────────────────
    if (parseFloat(amount) > withdrawable) {
      await WithdrawalHistory.create({
        user_id, fund_id: fund.id, segment,
        amount_requested: amount, amount_processed: null,
        withdrawal_type, status: "FAILED",
        bank_account: bank_account || fund.bank_account,
        failure_reason: `Insufficient balance. Available: ₹${withdrawable.toFixed(2)}`,
      });
      return res.status(400).json({
        success: false,
        message: `Insufficient withdrawable balance. Available: ₹${withdrawable.toFixed(2)}`,
      });
    }

    // ── Instant limit check → FAILED history ─────────────────────────────────
    if (withdrawal_type === "instant" && parseFloat(amount) > 200000) {
      await WithdrawalHistory.create({
        user_id, fund_id: fund.id, segment,
        amount_requested: amount, amount_processed: null,
        withdrawal_type, status: "FAILED",
        bank_account: bank_account || fund.bank_account,
        failure_reason: "Instant withdrawal limit is ₹2,00,000",
      });
      return res.status(400).json({ success: false, message: "Instant withdrawal limit is ₹2,00,000" });
    }

    // ── Deduct from fund ──────────────────────────────────────────────────────
    await fund.update({
      available_margin:     parseFloat(fund.available_margin)     - parseFloat(amount),
      available_cash:       parseFloat(fund.available_cash)       - parseFloat(amount),
      withdrawable_balance: parseFloat(fund.withdrawable_balance) - parseFloat(amount),
      payout:               parseFloat(fund.payout)               + parseFloat(amount),
      withdrawal_type,
      last_withdraw_amount: amount,
    });

    // ── Save PENDING history ──────────────────────────────────────────────────
    const history = await WithdrawalHistory.create({
      user_id, fund_id: fund.id, segment,
      amount_requested: amount, amount_processed: null,
      withdrawal_type, status: "PENDING",
      bank_account: bank_account || fund.bank_account,
    });

    return res.status(200).json({
      success: true,
      message: "Withdrawal initiated successfully",
      data: { fund, history },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/funds/withdraw/:historyId/status ───────────────────────────────
// Bank webhook / admin se: PENDING → PROCESSED or FAILED
export const updateWithdrawalStatus = async (req, res) => {
  try {
    const { historyId } = req.params;
    const { status, ref_no, amount_processed, failure_reason } = req.body;

    const history = await WithdrawalHistory.findByPk(historyId);
    if (!history)
      return res.status(404).json({ success: false, message: "Withdrawal record not found" });

    const updateData = { status };

    if (status === "PROCESSED") {
      updateData.ref_no           = ref_no || null;
      updateData.amount_processed = amount_processed || history.amount_requested;
      updateData.processed_at     = new Date();
    }

    if (status === "FAILED") {
      updateData.failure_reason = failure_reason || "Payment failed";

      // Refund karo
      const fund = await Fund.findByPk(history.fund_id);
      if (fund) {
        await fund.update({
          available_margin:     parseFloat(fund.available_margin)     + parseFloat(history.amount_requested),
          available_cash:       parseFloat(fund.available_cash)       + parseFloat(history.amount_requested),
          withdrawable_balance: parseFloat(fund.withdrawable_balance) + parseFloat(history.amount_requested),
          payout: Math.max(0, parseFloat(fund.payout)                 - parseFloat(history.amount_requested)),
        });
      }
    }

    await history.update(updateData);

    return res.status(200).json({ success: true, message: `Withdrawal marked as ${status}`, data: history });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/funds/withdraw/history/:userId ───────────────────────────────────
export const getWithdrawalHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { segment, status, limit = 20, page = 1 } = req.query;

    const where = { user_id: userId };
    if (segment) where.segment = segment;
    if (status)  where.status  = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await WithdrawalHistory.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    return res.status(200).json({
      success: true,
      data: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        history: rows,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};