import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  StarBorder as StarBorderIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

const tips = [
  {
    id: 1,
    title: 'Reset Password',
    description: 'To reset your password, go to Settings > Security > Change Password. Follow the prompts to create a new password.',
  },
  {
    id: 2,
    title: 'Change Desktop Wallpaper',
    description: 'Right-click on your desktop > Personalize > Choose from Windows Spotlight, Picture, or Solid color.',
  },
  {
    id: 3,
    title: 'Add Printer',
    description: 'Open Settings > Devices > Printers & scanners > Add a printer or scanner. Follow the on-screen instructions.',
  },
  // Add more tips as needed
];

const TipsAndTricks = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tips & Tricks
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Common IT solutions that don't require admin intervention
        </Typography>

        <Grid container spacing={3}>
          {tips.map((tip) => (
            <Grid item xs={12} sm={6} md={4} key={tip.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {tip.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {tip.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Tooltip title="Favorite">
                    <IconButton>
                      <StarBorderIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share">
                    <IconButton>
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default TipsAndTricks;
