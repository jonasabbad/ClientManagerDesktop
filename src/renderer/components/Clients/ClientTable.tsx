// ============================================================
// ClientTable — Paginated client data table
// ============================================================
import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Paper, IconButton, Tooltip, Chip, Avatar, Box,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/formatters';
import type { Client } from '../../types';

interface ClientTableProps {
  clients: Client[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

const ClientTable: React.FC<ClientTableProps> = ({
  clients, total, page, limit, onPageChange, onLimitChange, onEdit, onDelete,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6'];

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('clients.id')}</TableCell>
              <TableCell>{t('clients.fullName')}</TableCell>
              <TableCell>{t('clients.phone')}</TableCell>
              <TableCell>{t('clients.cin')}</TableCell>
              <TableCell>{t('clients.createdAt')}</TableCell>
              <TableCell align="center">{t('app.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client, idx) => (
              <TableRow
                key={client.id}
                hover
                onClick={() => navigate(`/clients/${client.id}`)}
                sx={{
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <TableCell>
                  <Chip label={`#${client.id}`} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        bgcolor: colors[idx % colors.length],
                      }}
                    >
                      {getInitials(client.full_name)}
                    </Avatar>
                    {client.full_name}
                  </Box>
                </TableCell>
                <TableCell>{client.phone || '—'}</TableCell>
                <TableCell>{client.cin || '—'}</TableCell>
                <TableCell>{formatDate(client.created_at)}</TableCell>
                <TableCell align="center">
                  <Tooltip title={t('app.edit')}>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); onEdit(client); }}
                      color="info"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('app.delete')}>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); onDelete(client); }}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        rowsPerPage={limit}
        onPageChange={(_, p) => onPageChange(p + 1)}
        onRowsPerPageChange={(e) => onLimitChange(parseInt(e.target.value))}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage=""
      />
    </Paper>
  );
};

export default ClientTable;
