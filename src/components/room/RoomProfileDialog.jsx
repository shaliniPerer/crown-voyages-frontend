import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, Typography, Box, Chip, ImageList, ImageListItem
} from '@mui/material';

const RoomProfileDialog = ({ open, onClose, selectedRoom }) => {
  if (!selectedRoom) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Room Profile</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1"><strong>Name:</strong> {selectedRoom.roomName}</Typography>
            <Typography variant="subtitle1"><strong>Type:</strong> {selectedRoom.roomType}</Typography>
            <Typography variant="subtitle1"><strong>Size:</strong> {selectedRoom.size} sqm</Typography>
            <Typography variant="subtitle1"><strong>Bed Type:</strong> {selectedRoom.bedType}</Typography>
            <Typography variant="subtitle1"><strong>Max Occupancy:</strong> {selectedRoom.maxAdults} adults, {selectedRoom.maxChildren} children</Typography>

            {selectedRoom.amenities?.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>Amenities</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedRoom.amenities.map((a, i) => <Chip key={i} label={a} />)}
                </Box>
              </>
            )}

            {selectedRoom.transportations?.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>Transportations</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedRoom.transportations.map((t, i) => (
                    <Chip key={i} label={`${t.type.toUpperCase()}: ${t.method}`} />
                  ))}
                </Box>
              </>
            )}

            {selectedRoom.price && (
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                <strong>Price:</strong> ${selectedRoom.price}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            {selectedRoom.images?.length > 0 && (
              <>
                <Typography variant="subtitle1">Gallery</Typography>
                <ImageList cols={2} rowHeight={140} gap={8}>
                  {selectedRoom.images.map((url, i) => (
                    <ImageListItem key={i}>
                      <img src={url} alt={`room-${i}`} loading="lazy" />
                    </ImageListItem>
                  ))}
                </ImageList>
              </>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomProfileDialog;
