import { LoanService } from '../services/loanService.js';

export const requestLoan = async (req, res) => {
  try {
    const { bookId } = req.body;
    let targetUserId = req.user.id;
    if ((req.user.role === 'ADMIN' || req.user.role === 'LIBRARIAN') && req.body.userId) targetUserId = req.body.userId;
    return res.status(201).json(await LoanService.requestLoan(targetUserId, bookId));
  } catch (error) { return res.status(400).json({ message: error.message }); }
};

export const returnBook = async (req, res) => {
  try { return res.status(200).json(await LoanService.returnBook(req.params.id)); }
  catch (error) { return res.status(400).json({ message: error.message }); }
};

export const getLoans = async (req, res) => {
  try {
    const filters = {};
    if (req.user.role === 'CLIENT') filters.userId = req.user.id;
    else if (req.query.userId) filters.userId = req.query.userId;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.bookId) filters.bookId = req.query.bookId;
    return res.status(200).json(await LoanService.getLoans(filters));
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

export const getHistory = async (req, res) => {
  try {
    let targetUserId = null;
    if (req.user.role === 'CLIENT') targetUserId = req.user.id;
    else if (req.query.userId) targetUserId = req.query.userId;
    return res.status(200).json(await LoanService.getHistory(targetUserId));
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

export const getRequestQueue = async (req, res) => {
  try { return res.status(200).json(await LoanService.getRequestQueue(req.query.bookId)); }
  catch (error) { return res.status(500).json({ message: error.message }); }
};

export const approveRequest = async (req, res) => {
  try { return res.status(200).json(await LoanService.approveLoanRequest(req.params.id)); }
  catch (error) { return res.status(400).json({ message: error.message }); }
};

export const rejectRequest = async (req, res) => {
  try { return res.status(200).json(await LoanService.rejectLoanRequest(req.params.id)); }
  catch (error) { return res.status(400).json({ message: error.message }); }
};
