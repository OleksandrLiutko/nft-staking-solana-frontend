import React, { forwardRef } from 'react'
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Toast = (props) => {
    const { open, message, handleClose, type } = props
    const vertical = "bottom"
    const horizontal = "right"
    return (
        <Snackbar style={{ 'zIndex': 9999 }} open={open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical, horizontal }}>
            <Alert onClose={handleClose} severity={type === 1 ? "success" : "error"} sx={{ width: '100%' }} style={{ fontSize: "12px" }}>
                {message}
            </Alert>
        </Snackbar>
    )
}

export default Toast;