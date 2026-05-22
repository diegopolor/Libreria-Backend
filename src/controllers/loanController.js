import { LoanService } from '../services/loanService.js';

export const requestLoan = async (req, res) => {
  try {
    const { bookId } = req.body;
    // Si el usuario es un CLIENT, solo puede solicitar para sí mismo.
    // Si es ADMIN o LIBRARIAN, podría solicitar para otro si envía el userId, si no, para sí mismo.
    let targetUserId = req.user.id;
    if ((req.user.role === 'ADMIN' || req.user.role === 'LIBRARIAN') && req.body.userId) {
      targetUserId = req.body.userId;
    }

    const result = await LoanService.requestLoan(targetUserId, bookId);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const returnBook = async (req, res) => {
  try {
    const { id } = req.params; // ID del préstamo
    const loan = await LoanService.returnBook(id);
    return res.status(200).json(loan);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getLoans = async (req, res) => {
  try {
    const filters = {};
    // Si es CLIENT, solo ve sus propios préstamos
    if (req.user.role === 'CLIENT') {
      filters.userId = req.user.id;
    } else if (req.query.userId) {
      filters.userId = req.query.userId;
    }

    if (req.query.status) {
      filters.status = req.query.status;
    }
    if (req.query.bookId) {
      filters.bookId = req.query.bookId;
    }

    const loans = await LoanService.getLoans(filters);
    return res.status(200).json(loans);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    let targetUserId = null;
    // Si es cliente, solo ve su propio historial (Pila LIFO)
    if (req.user.role === 'CLIENT') {
      targetUserId = req.user.id;
    } else if (req.query.userId) {
      targetUserId = req.query.userId;
    }

    const history = await LoanService.getHistory(targetUserId);
    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getRequestQueue = async (req, res) => {
  try {
    const { bookId } = req.query;
    const queue = await LoanService.getRequestQueue(bookId);
    return res.status(200).json(queue);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const { id } = req.params; // ID de la solicitud
    const loan = await LoanService.approveLoanRequest(id);
    return res.status(200).json(loan);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params; // ID de la solicitud
    const request = await LoanService.rejectLoanRequest(id);
    return res.status(200).json(request);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
