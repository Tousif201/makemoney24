import Razorpay from 'razorpay';
import { User } from '../models/User.model.js'; // Assuming you have a User model

// Initialize Razorpay with your API keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const withdrawMoneyWithNewDetails = async (req, res) => {
  try {
    const { amount, bankAccountNumber, ifscCode, accountHolderName } = req.body;
    const userId = req.user._id; // Assuming you have authentication middleware

    // 1. Fetch User
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (!bankAccountNumber || !ifscCode || !accountHolderName || !amount) {
      return res.status(400).json({ error: 'Amount and bank account details are required.' });
    }

    // 2. Check if a RazorpayX Contact exists for this user
    if (!user.razorpayXContactId) {
      // 3. Create a RazorpayX Contact
      const contactPayload = {
        name: accountHolderName,
        email: user.email, 
        phone: user.phone,
        type: 'customer',
      };
      const contact = await razorpay.payouts.createContact(contactPayload);
      user.razorpayXContactId = contact.id;
      await user.save();
    }
    const contactId = user.razorpayXContactId;

    let fundAccountId;
    // 4. Check if a RazorpayX Fund Account exists for this contact and bank details
    const fundAccounts = await razorpay.payouts.getFundAccounts({
      contact_id: contactId,
      account_number: bankAccountNumber,
      ifsc: ifscCode,
    });

    if (fundAccounts && fundAccounts.items.length > 0) {
      fundAccountId = fundAccounts.items[0].id;
    } else {
      // 5. Create a RazorpayX Fund Account for the bank account
      const fundAccountPayload = {
        contact_id: contactId,
        account_type: 'bank_account',
        bank_account: {
          name: accountHolderName,
          account_number: bankAccountNumber,
          ifsc: ifscCode,
        },
      };
      const fundAccount = await razorpay.payouts.createFundAccount(fundAccountPayload);
      fundAccountId = fundAccount.id;
    }

    // 6. Initiate the RazorpayX Payout
    const payoutPayload = {
      account_id: fundAccountId,
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      mode: 'IMPS',
      purpose: 'USER_WITHDRAWAL',
      queue_if_low_balance: true,
      reference_id: `withdrawal_${userId}_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        withdrawalAmount: amount.toString(),
      },
    };

    const payout = await razorpay.payouts.create(payoutPayload);

    // 7. Optionally, track the payout status
    // Example: await WithdrawalRequest.create({ userId, amount, bankAccountNumber, ifscCode, razorpayXPayoutId: payout.id, status: payout.status });

    res.status(200).json({ message: 'Withdrawal initiated successfully.', payoutId: payout.id, status: payout.status });

  } catch (error) {
    console.error('Error initiating RazorpayX payout with new details:', error);
    res.status(500).json({ error: 'Failed to initiate withdrawal.', details: error.message });
  }
};