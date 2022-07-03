import { useState, useEffect } from 'react';
import {
  ChakraProvider,
  theme,
  Container,
  Box,
  Input,
  Button,
  Badge,
  Stack,
  Heading,
  useToast,
} from '@chakra-ui/react';
import { ethers, utils } from 'ethers';

import { ConnectWalletButton } from './components';
import abi from './contract/Bank.json';

function App() {
  const [haveMetamask, setHaveMetamask] = useState(true);
  const [accountAddress, setAccountAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [,setOwnerAddress] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [bankName, setBankName] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [customerBalance, setCustomerBalance] = useState(0);
  const [depositValue, setDepositValue] = useState('');
  const [withdrawValue, setWithdrawValue] = useState('');
  const toast = useToast();
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const contractAbi = abi.abi;

  const toastConfig = {
    title: 'Please install Metamask',
    duration: 4000,
    status: 'warning',
    position: 'top-right',
  };

  const checkMetamaskAvailability = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      setHaveMetamask(false);
    } else {
      setHaveMetamask(true);
    }
  };

  const connectWallet = async () => {
    const { ethereum } = window;
    try {
      if (!ethereum) setHaveMetamask(false);

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      setAccountAddress(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const getBankName = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        let bankName = await bankContract.name();
        bankName = utils.parseBytes32String(bankName);
        setBankName(bankName.toString());
      } else {
        setHaveMetamask(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const setBankNameHandler = async (e) => {
    e.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        const txn = await bankContract.setBankName(
          utils.formatBytes32String(inputValue)
        );
        await txn.wait();
        await getBankName();
        setInputValue('');
      } else {
        setHaveMetamask(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCustomerBalance = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        let customerBalance = await bankContract.getCustomerBalance();
        setCustomerBalance(utils.formatEther(customerBalance));
      } else {
        setHaveMetamask(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deposit = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        const txn = await bankContract.deposit({
          value: utils.parseEther(depositValue),
        });
        await txn.wait();
        await getCustomerBalance();
        setDepositValue('');
      } else {
        setHaveMetamask(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const withdraw = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        let myAddress = await signer.getAddress();

        const txn = await bankContract.withdraw(
          myAddress,
          utils.parseEther(withdrawValue)
        );
        await txn.wait();
        await getCustomerBalance();
        setWithdrawValue('');
      } else {
        setHaveMetamask(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBankOwner = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        let owner = await bankContract.owner();
        setOwnerAddress(owner);

        const [account] = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        owner.toLowerCase() === account.toLowerCase() ? setIsOwner(true) : setIsOwner(false);
      } else {
        setHaveMetamask(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkMetamaskAvailability();
    getBankName();
    getBankOwner();
    getCustomerBalance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!haveMetamask) toast(toastConfig);

  return (
    <ChakraProvider theme={theme}>
      <Container
        maxW={'container.xl'}
        minH={'100vh'}
        centerContent
        display={'flex'}
        justifyContent='center'
        alignItems={'center'}
        bg={'purple.900'}
      >
        <Box
          display={'flex'}
          justifyContent='center'
          alignItems={'center'}
          flexDir='column'
          bg={'purple.800'}
          minW={['100%', 'lg', 'xl']}
          minH={'lg'}
          borderRadius='2xl'
        >
          <Heading as='h1' size='xl' color={'yellow.400'}>
            {bankName}
          </Heading>
          {isConnected && (
            <Stack spacing={3} my='5'>
              {isOwner && (
                <>
                  <Input
                    type={'text'}
                    variant='filled'
                    color='white'
                    size='lg'
                    placeholder='Name'
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Button onClick={setBankNameHandler}>Change Bank Name</Button>
                </>
              )}
              <Input
                type={'text'}
                variant='filled'
                color='white'
                size='lg'
                placeholder='ETH'
                onChange={(e) => setDepositValue(e.target.value)}
              />
              <Button onClick={deposit}>Deposit</Button>
              <Input
                type={'text'}
                variant='filled'
                color='white'
                size='lg'
                placeholder='ETH'
                onChange={(e) => setWithdrawValue(e.target.value)}
              />
              <Button onClick={withdraw}>Withdraw</Button>
              <Badge
                title='Your Balance'
                variant='solid'
                colorScheme='green'
                fontSize='xl'
                my='5'
                textAlign='center'
              >
                {customerBalance}
              </Badge>
            </Stack>
          )}
          <ConnectWalletButton
            isConnected={isConnected}
            accountAddress={accountAddress}
            connectWallet={connectWallet}
          />
        </Box>
      </Container>
    </ChakraProvider>
  );
}

export default App;
