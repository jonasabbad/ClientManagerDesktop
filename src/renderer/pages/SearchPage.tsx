// ============================================================
// SearchPage — Global search with instant results
// ============================================================
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GlobalSearch from '../components/Search/GlobalSearch';

const SearchPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('search.title')}
      </Typography>
      <GlobalSearch initialQuery={query} />
    </Box>
  );
};

export default SearchPage;
