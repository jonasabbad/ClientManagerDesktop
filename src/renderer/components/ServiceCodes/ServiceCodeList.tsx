// ============================================================
// ServiceCodeList — Display codes in a clean table-like list row format
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  List, ListItem, IconButton, Chip, Box, Tooltip, Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/formatters';
import type { ServiceCode } from '../../types';

interface ServiceCodeListProps {
  codes: ServiceCode[];
  onEdit: (code: ServiceCode) => void;
  onDelete: (code: ServiceCode) => void;
  onCopySuccess?: (message: string) => void;
  onCopyError?: (error: string) => void;
  refreshKey?: number;
}

const ServiceCodeList: React.FC<ServiceCodeListProps> = ({
  codes, onEdit, onDelete, onCopySuccess, onCopyError, refreshKey = 0
}) => {
  const { t } = useTranslation();
  const [copiedIds, setCopiedIds] = useState<Set<number>>(new Set());
  const [copyingId, setCopyingId] = useState<number | null>(null);

  // Reset copied states when refresh is clicked
  useEffect(() => {
    setCopiedIds(new Set());
  }, [refreshKey]);

  const handleCopy = async (id: number, text: string) => {
    setCopyingId(id);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      if (onCopySuccess) {
        onCopySuccess("Code copié dans le presse-papiers !");
      }
    } catch (err) {
      if (onCopyError) {
        onCopyError("Échec de la copie dans le presse-papiers.");
      }
      console.error('Failed to copy text: ', err);
    } finally {
      setCopyingId(null);
    }
  };

  return (
    <List disablePadding>
      {codes.map((code) => {
        const isCopied = copiedIds.has(code.id);
        const displayName = code.subcategory_name
          ? `${code.category_name} ➔ ${code.subcategory_name}`
          : code.category_name;

        return (
          <ListItem
            key={code.id}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              py: 2,
              px: 1,
              transition: 'background-color 0.15s',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: { xs: 1.5, md: 3 },
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {/* Column 1: Category & Sub-Service & Date */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                flex: { xs: 'none', md: '0 0 240px' },
                minWidth: 0,
                width: { xs: '100%', md: 'auto' },
              }}
            >
              <Chip
                label={displayName}
                size="small"
                sx={{
                  bgcolor: code.category_color || '#6366f1',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  alignSelf: 'flex-start',
                  maxWidth: '100%',
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {formatDate(code.created_at)}
              </Typography>
            </Box>

            {/* Column 2: Service Code & Custom Fields */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                flex: 1,
                minWidth: 0,
                width: { xs: '100%', md: 'auto' },
              }}
            >
              <Typography
                variant="body1"
                fontWeight={700}
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '1.05rem',
                  color: 'text.primary',
                  wordBreak: 'break-all',
                }}
              >
                {code.code}
              </Typography>

              {/* Custom values block */}
              {code.customValues && code.customValues.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mt={0.2}>
                  {code.customValues.map((v) => (
                    <Typography key={v.id} variant="caption" color="text.secondary">
                      <strong>{v.label} :</strong> {v.value}
                    </Typography>
                  ))}
                </Box>
              )}

              {/* Description & Notes block */}
              {(code.label || code.notes) && (
                <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mt={0.2}>
                  {code.label && (
                    <Typography variant="caption" color="text.secondary">
                      <strong>Description :</strong> {code.label}
                    </Typography>
                  )}
                  {code.notes && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      * {code.notes}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {/* Column 3: Actions Area */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flex: { xs: 'none', md: '0 0 150px' },
                justifyContent: { xs: 'flex-end', md: 'flex-end' },
                width: { xs: '100%', md: 'auto' },
                borderTop: { xs: '1px solid', md: 'none' },
                borderColor: 'divider',
                pt: { xs: 1.5, md: 0 },
              }}
            >
              <Tooltip title={isCopied ? "Copied!" : "Copy"}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(code.id, code.code)}
                    disabled={copyingId === code.id}
                    color={isCopied ? 'success' : 'default'}
                  >
                    {isCopied ? (
                      <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
                    ) : (
                      <CopyIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={t('app.edit')}>
                <IconButton size="small" onClick={() => onEdit(code)} color="info">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('app.delete')}>
                <IconButton size="small" onClick={() => onDelete(code)} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </ListItem>
        );
      })}
    </List>
  );
};

export default ServiceCodeList;
