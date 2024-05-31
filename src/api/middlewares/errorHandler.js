const errorHandler = (err, req, res, next) => {
    console.error(`Error on request ${req.method} ${req.path}: ${err.message}`);
    if (err.status) {

        return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
};

export default errorHandler;
