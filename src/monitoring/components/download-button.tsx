import React from 'react';

import styled from '../../theme';
import { VideoIcon } from '../../common/icons';

interface ButtonProps {
  onClick: () => void;
  children?: any;
}

export default function DownloadButton({ onClick, children }: ButtonProps) {
  return (
    <Button onClick={onClick}>
      <StyledVideoIcon wrapperSize={22} iconSize={22} color={'#ffffff'} backgroundColor={'transparent'} active={true} />
      {children}
    </Button>
  );
}

const Button = styled.button`
  position: relative;
  margin: 12px auto;
  padding: 4px 16px 4px 16px;
  width: 100%;
  max-width: 365px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  line-height: 2;
  text-align: center;
  color: #ffffff;
  text-decoration: none;
  background-color: #4a90e2;
  border: 1px solid #dfe3e9;
  border-radius: 4px;
  &::first-letter {
    text-transform: capitalize;
  }
`;

const StyledVideoIcon = styled(VideoIcon)`
  margin-right: 8px;
`;
