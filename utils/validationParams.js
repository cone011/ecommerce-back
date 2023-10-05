exports.ValidationParams = (res, listErrors) => {
  if (!listErrors.isEmpty()) {
    let currentError = listErrors.errors[0];
    const error = `Error: ${currentError.msg}`;
    res.status(422).json({ message: error });
    return true;
  }
};
