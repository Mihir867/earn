import {
  Box,
  Button,
  Flex,
  Text,
  Image,
  VStack,
  Center,
  Link,
  Checkbox,
} from '@chakra-ui/react';
import { JobsType } from '../../interface/listings';
import { SponsorType } from '../../interface/sponsor';
import Slider from 'react-slick';
import { useQuery } from '@tanstack/react-query';
import { TalentTVE } from '../../utils/functions';
interface SideBarProps {
  jobs:
    | {
        jobs: JobsType;
        sponsorInfo: SponsorType;
      }[]
    | undefined;
  total: number;
  listings: number;
}
const SideBar = ({ jobs, listings, total }: SideBarProps) => {
  return (
    <Flex
      flexDirection={'column'}
      w={'22.125rem'}
      borderLeft={'0.0625rem solid #F1F5F9'}
      ml={'1.5rem'}
      pt={'1.5rem'}
      pl={'1.25rem'}
      rowGap={'2.5rem'}
    >
      <GettingStarted />
      <TotalStats total={listings} listings={total} />
      {/* <AlphaAccess /> */}
      {/* <Filter title={'FILTER BY INDUSTRY'} entries={['Gaming', 'Payments', 'Consumer', 'Infrastructure', 'DAOs']} /> */}
      <RecentEarners />
      <HiringNow jobs={jobs} />
      <Featured />
    </Flex>
  );
};

export default SideBar;

const Step = ({
  number,
  isComplete,
}: {
  number: number;
  isComplete: boolean;
}) => {
  if (isComplete) {
    return (
      <Center
        zIndex={'200'}
        h={'2.375rem'}
        w={'2.375rem'}
        bg={'#6366F1'}
        rounded={'full'}
      >
        <Image
          w={'1.25rem'}
          h={'1.25rem'}
          src="/assets/icons/white-tick.svg"
          alt=""
        />
      </Center>
    );
  }

  return (
    <Center
      zIndex={'200'}
      bg={'#FFFFFF'}
      color={'#94A3B8'}
      h={'2.375rem'}
      w={'2.375rem'}
      border={'0.0625rem solid #94A3B8'}
      rounded={'full'}
    >
      {number}
    </Center>
  );
};

const GettingStarted = () => {
  return (
    <Box>
      <Text mb={'1.5rem'} color={'#94A3B8'}>
        GETTING STARTED
      </Text>
      <Flex h={'12.5rem'}>
        <VStack
          h={'100%'}
          position={'relative'}
          justifyContent={'space-between'}
          mr={'0.8125rem'}
        >
          <Step number={1} isComplete={true} />
          <Step number={2} isComplete={false} />
          <Step number={3} isComplete={false} />
          <Flex
            w={'0.0625rem'}
            h={'90%'}
            position={'absolute'}
            bg={'#CBD5E1'}
          />
        </VStack>
        <VStack
          h={'100%'}
          position={'relative'}
          justifyContent={'space-between'}
        >
          <Box>
            <Text color={'black'} fontSize={'0.875rem'}>
              Create your account
            </Text>
            <Text fontSize={'0.8125rem'} color={'#64748B'}>
              and get personalized notifications
            </Text>
          </Box>
          <Box>
            <Text color={'black'} fontSize={'0.875rem'}>
              Complete your profile
            </Text>
            <Text fontSize={'0.8125rem'} color={'#64748B'}>
              and get seen by hiring managers
            </Text>
          </Box>
          <Box>
            <Text color={'black'} fontSize={'0.875rem'}>
              Win a bounty
            </Text>
            <Text fontSize={'0.8125rem'} color={'#64748B'}>
              and get your Proof-of-Work NFT
            </Text>
          </Box>
        </VStack>
      </Flex>
    </Box>
  );
};

const TotalStats = ({
  total,
  listings,
}: {
  total: number;
  listings: number;
}) => {
  return (
    <Flex
      px={'0.5rem'}
      h={'69'}
      bg={'#F8FAFC'}
      rounded={'md'}
      alignItems={'center'}
      justifyContent={'space-between'}
    >
      <Flex>
        <Image
          h={'1.5625rem'}
          alt=""
          src="assets/icons/lite-purple-dollar.svg"
          mr={'0.5rem'}
          mb={'auto'}
        />
        <Box>
          <Text fontWeight={'600'} color={'black'} fontSize={'0.875rem'}>
            ${listings.toLocaleString()} USD
          </Text>
          <Text fontWeight={'400'} color={'#64748B'} fontSize={'0.75rem'}>
            Total Value Listed
          </Text>
        </Box>
      </Flex>
      <Box w={'0.0625rem'} h={'50%'} bg={'#CBD5E1'}></Box>
      <Flex>
        <Image
          h={'25x'}
          alt=""
          src="assets/icons/lite-purple-suitcase.svg"
          mr={'0.5rem'}
          mb={'auto'}
        />
        <Box>
          <Text fontWeight={'600'} color={'black'} fontSize={'0.875rem'}>
            {total}
          </Text>
          <Text fontWeight={'400'} color={'#64748B'} fontSize={'0.75rem'}>
            Listed Opportunities
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
};

interface EarnerProps {
  name: string;
  avatar?: string;
  amount: number;
  work?: string;
}
const Earner = ({ amount, name, avatar, work }: EarnerProps) => {
  return (
    <Flex my={1} align={'center'} w={'100%'}>
      <Image
        mr={'1.0625rem'}
        w={'2.125rem'}
        h={'2.125rem'}
        rounded={'full'}
        src={avatar !== '' ? avatar : 'https://bit.ly/kent-c-dodds'}
        alt=""
      />
      <Box>
        <Text fontWeight={'500'} color={'black'} fontSize={'0.8125rem'}>
          {name}
        </Text>
        <Text color={'#64748B'} fontSize={'0.8125rem'}>
          {work?.slice(0, 20)}
        </Text>
      </Box>
      <Flex columnGap={'0.3125rem'} ml={'auto'}>
        <Image src="/assets/landingsponsor/icons/usdc.svg" alt="" />
        <Text>${amount.toLocaleString()}</Text>
      </Flex>
    </Flex>
  );
};

const RecentEarners = () => {
  const talent = useQuery({
    queryKey: ['talent'],
    queryFn: () => TalentTVE(),
  });

  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 6,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    autoplay: true,
    autoplaySpeed: 200,
  };
  return (
    <Box>
      <Text mb={'1.5rem'} color={'#94A3B8'}>
        RECENT EARNERS
      </Text>
      <VStack rowGap={'1.8125rem'}>
        <Slider {...settings}>
          {talent.data?.map((t) => {
            return (
              <Earner
                amount={t.tve ?? 0}
                name={t.firstname + ' ' + t.lastname}
                avatar={t.avatar}
                key={t.id}
                work={t.currentEmployer}
              />
            );
          })}
        </Slider>
      </VStack>
    </Box>
  );
};

interface HiringProps {
  title: string;
  logo: string;
  location: string;
  type: string;
}
const Hiring = ({ logo, title, location, type }: HiringProps) => {
  return (
    <Flex align={'center'} w={'100%'}>
      <Image
        mr={'1.0625rem'}
        w={'2.125rem'}
        h={'2.125rem'}
        rounded={'md'}
        src={logo ?? '/assets/home/placeholder/ph2.png'}
        alt=""
      />
      <Box>
        <Link
          href={
            `https://earn-frontend-v2.vercel.app/listings/jobs/` +
            title.split(' ').join('-')
          }
          isExternal
        >
          <Text fontWeight={'500'} color={'black'} fontSize={'0.8125rem'}>
            {title}
          </Text>
        </Link>
        <Text color={'#64748B'} fontSize={'0.8125rem'}>
          {location}, {type}
        </Text>
      </Box>
    </Flex>
  );
};

interface HiringNowProps {
  jobs:
    | {
        jobs: JobsType;
        sponsorInfo: SponsorType;
      }[]
    | undefined;
}
const HiringNow = ({ jobs }: HiringNowProps) => {
  return (
    <Box>
      <Text mb={'1.5rem'} color={'#94A3B8'}>
        HIRING NOW
      </Text>
      <VStack rowGap={'1.8125rem'}>
        {jobs?.map((job) => {
          return (
            <Hiring
              type={job.jobs.jobType}
              location={job.jobs.location}
              key={job.jobs.id}
              logo={job.sponsorInfo.logo}
              title={job.jobs.title}
            />
          );
        })}
      </VStack>
    </Box>
  );
};

const Featuring = () => {
  return (
    <Flex align={'center'} w={'100%'}>
      <Image
        mr={'1.0625rem'}
        w={'2.125rem'}
        h={'2.125rem'}
        rounded={'full'}
        src="https://bit.ly/kent-c-dodds"
        alt=""
      />
      <Box>
        <Text fontWeight={'500'} color={'black'} fontSize={'0.8125rem'}>
          Madhur Dixit
        </Text>
        <Text color={'#64748B'} fontSize={'0.8125rem'}>
          won Underdog Smart...
        </Text>
      </Box>
      <Flex columnGap={'0.3125rem'} ml={'auto'}>
        <Text fontSize={'0.875rem'} color={'#3B82F6'}>
          View
        </Text>
      </Flex>
    </Flex>
  );
};

const Featured = () => {
  return (
    <Box>
      <Text mb={'1.5rem'} color={'#94A3B8'}>
        FEATURED
      </Text>
      <VStack rowGap={'1.8125rem'}>
        <Featuring />
        <Featuring />
        <Featuring />
        <Featuring />
        <Featuring />
      </VStack>
    </Box>
  );
};

const AlphaAccess = () => {
  return (
    <Flex
      direction={'column'}
      py={'0.875rem'}
      px={'1.5625rem'}
      rounded={'lg'}
      w={'22.125rem'}
      h={'14.25rem'}
      bg={"url('/assets/home/display/grizzly.png')"}
    >
      <Text color={'white'} fontWeight={'600'} fontSize={'1.25rem'} mt={'auto'}>
        Want Early Access to Projects?
      </Text>
      <Text
        lineHeight={'1.1875rem'}
        fontSize={'1rem'}
        color={'white'}
        mt={'0.5rem'}
      >
        Get exclusive early access to the latest Solana projects and win product
        feedback bounties, for free.
      </Text>
      <Button
        fontWeight={'500'}
        py={'0.8125rem'}
        bg={'#FFFFFF'}
        mt={'1.5625rem'}
      >
        Join the Alpha Squad
      </Button>
    </Flex>
  );
};

const FilterEntry = ({ label }: { label: string }) => {
  return (
    <Flex justifyContent={'space-between'}>
      <Checkbox size="md" colorScheme="blue" defaultChecked>
        <Text color={'#64748B'} fontSize={'0.875rem'} ml={'0.625rem'}>
          {label}
        </Text>
      </Checkbox>
      <Text color={'#64748B'} fontSize={'0.875rem'} ml={'0.625rem'}>
        {1234}
      </Text>
    </Flex>
  );
};

const Filter = ({ title, entries }: { title: string; entries: string[] }) => {
  return (
    <Box>
      <Text mb={'1.5rem'} color={'#94A3B8'}>
        {title}
      </Text>
      <Flex flexDirection={'column'} rowGap={'1rem'}>
        {entries.map((ele) => {
          return <FilterEntry key={'fil' + ele} label={ele} />;
        })}
      </Flex>
    </Box>
  );
};
