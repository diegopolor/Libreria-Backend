import { UserService } from '../services/userService.js';

export const createUser = async (req, res) => {
  try { return res.status(201).json(await UserService.createUser(req.body)); }
  catch (error) { return res.status(400).json({ message: error.message }); }
};

export const getUsers = async (req, res) => {
  try { return res.status(200).json(await UserService.getUsers()); }
  catch (error) { return res.status(500).json({ message: error.message }); }
};

export const updateUser = async (req, res) => {
  try { return res.status(200).json(await UserService.updateUser(req.params.id, req.body)); }
  catch (error) { return res.status(400).json({ message: error.message }); }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) return res.status(400).json({ message: 'No puedes eliminar tu propio usuario.' });
    await UserService.deleteUser(req.params.id);
    return res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
  } catch (error) { return res.status(400).json({ message: error.message }); }
};
