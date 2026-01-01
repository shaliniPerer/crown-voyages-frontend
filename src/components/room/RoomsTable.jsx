import React from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Paper, Typography, IconButton, Button
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const RoomsTable = ({ rooms, hotels, onEdit, onDelete, onViewProfile }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Hotel</TableCell>
            <TableCell>Room Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Size (sqm)</TableCell>
            <TableCell>Bed Type</TableCell>
            <TableCell>Max Occupancy</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rooms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography color="textSecondary">No rooms found</Typography>
              </TableCell>
            </TableRow>
          ) : (
            rooms.map((r) => (
              <TableRow key={r._id}>
                <TableCell>
                  {(() => {
                    const hotel = r.resort;
                    if (!hotel) return 'Unknown';
                    const hotelId = typeof hotel === 'object' ? (hotel._id || hotel.$oid) : hotel;
                    return hotels.find(h => h._id === hotelId)?.name || 'Unknown';
                  })()}
                </TableCell>
                <TableCell>{r.roomName}</TableCell>
                <TableCell>{r.roomType}</TableCell>
                <TableCell>{r.size}</TableCell>
                <TableCell>{r.bedType}</TableCell>
                <TableCell>{r.maxAdults} adults, {r.maxChildren} children</TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit(r)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(r._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                  <Button onClick={() => onViewProfile(r)} variant="outlined" size="small">
                    Profile
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RoomsTable;
