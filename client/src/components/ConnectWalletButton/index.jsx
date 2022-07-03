import { Button } from '@chakra-ui/react';

const ConnectWalletButton = ({
  isConnected,
  connectWallet,
  accountAddress,
}) => {
  return (
    <Button colorScheme={'messenger'} size='lg' my='5' onClick={connectWallet}>
      {isConnected
        ? `${accountAddress.slice(0, 16)}...${accountAddress.slice(38, 42)}`
        : 'Connect Wallet'}
    </Button>
  );
};

export default ConnectWalletButton;
