// ============================================================
// CopyableId — Chip showing an ID that is copied on click
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import type { ChipProps } from '@mui/material';
import {
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { copyToClipboard } from '../../utils/clipboard';

interface CopyableIdProps extends Omit<ChipProps, 'label' | 'icon' | 'onClick'> {
  /** Exact value copied to the clipboard. */
  value: string;
  /** Displayed text, when it differs from the copied value. */
  label?: string;
  /**
   * Keep the "copied" state until the component unmounts (or the value
   * changes) and show a small status caption under the chip.
   */
  persistent?: boolean;
}

type CopyStatus = 'idle' | 'copied' | 'error';

const FEEDBACK_MS = 1500;

const CopyableId: React.FC<CopyableIdProps> = ({ value, label, persistent = false, sx, ...chipProps }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<CopyStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // A different ID is a different copy target: start from scratch.
  useEffect(() => { setStatus('idle'); }, [value]);

  const resetLater = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus('idle'), FEEDBACK_MS);
  };

  const handleCopy = async (event: React.MouseEvent) => {
    // Keep row-level click handlers (e.g. navigation) from firing.
    event.stopPropagation();
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!(await copyToClipboard(value))) {
      setStatus('error');
      resetLater();
      return;
    }
    setStatus('copied');
    if (!persistent) resetLater();
  };

  const tooltip =
    status === 'copied' ? t('app.copied') : status === 'error' ? t('app.copyFailed') : t('app.copyId');

  const icon =
    status === 'copied' ? <CheckIcon /> : status === 'error' ? <ErrorIcon /> : <CopyIcon />;

  const chip = (
    <Tooltip title={tooltip} placement="top" arrow>
      <Chip
        {...chipProps}
        label={label ?? value}
        icon={icon}
        onClick={handleCopy}
        sx={{
          cursor: 'pointer',
          transition: 'box-shadow 0.15s ease, transform 0.15s ease, background-color 0.15s ease',
          '&:hover': { boxShadow: 2 },
          '&:active': { transform: 'scale(0.98)' },
          '& .MuiChip-icon': {
            color: status === 'copied' ? 'success.main' : status === 'error' ? 'error.main' : 'inherit',
            opacity: status === 'idle' ? 0.55 : 1,
            transition: 'opacity 0.15s ease',
          },
          '&:hover .MuiChip-icon': { opacity: 1 },
          ...sx,
        }}
      />
    </Tooltip>
  );

  if (!persistent) return chip;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
      {chip}
      <Typography
        variant="caption"
        role="status"
        aria-live="polite"
        sx={{
          minHeight: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          fontWeight: 600,
          color: status === 'error' ? 'error.main' : 'success.main',
          visibility: status === 'idle' ? 'hidden' : 'visible',
        }}
      >
        {status === 'error' ? (
          <><ErrorIcon sx={{ fontSize: 16 }} />{t('app.copyFailed')}</>
        ) : (
          <><CheckIcon sx={{ fontSize: 16 }} />{t('app.copied')}</>
        )}
      </Typography>
    </Box>
  );
};

export default CopyableId;
