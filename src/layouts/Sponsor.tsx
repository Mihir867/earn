import { AddIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  type FlexProps,
  Icon,
  Link,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { usePostHog } from 'posthog-js/react';
import { type ReactNode, useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import {
  MdList,
  MdOutlineChatBubbleOutline,
  MdOutlineGroup,
} from 'react-icons/md';

import { EntityNameModal } from '@/components/modals/EntityNameModal';
import { FeatureModal } from '@/components/modals/FeatureModal';
import { LoadingSection } from '@/components/shared/LoadingSection';
import { SelectHackathon, SelectSponsor } from '@/features/listing-builder';
import {
  CreateListingModal,
  SponsorInfoModal,
} from '@/features/sponsor-dashboard';
import { Default } from '@/layouts/Default';
import { Meta } from '@/layouts/Meta';
import { userStore } from '@/store/user';

interface LinkItemProps {
  name: string;
  link?: string;
  icon: IconType;
  isExternal?: boolean;
  posthog?: string;
}

interface NavItemProps extends FlexProps {
  icon: IconType;
  link?: string;
  children: ReactNode;
}

export function Sidebar({ children }: { children: ReactNode }) {
  const { userInfo, setUserInfo } = userStore();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const posthog = usePostHog();
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [latestActiveSlug, setLatestActiveSlug] = useState<string | undefined>(
    undefined,
  );

  const { query } = router;
  const open = !!query.open; // Replace 'paramName' with the actual parameter name
  useEffect(() => {
    if (open) {
      onOpen();
    }
  }, [open]);

  const {
    isOpen: isSponsorInfoModalOpen,
    onOpen: onSponsorInfoModalOpen,
    onClose: onSponsorInfoModalClose,
  } = useDisclosure();

  const {
    isOpen: isScoutAnnounceModalOpen,
    onOpen: onScoutAnnounceModalOpen,
    onClose: onScoutAnnounceModalClose,
  } = useDisclosure();

  function sponsorInfoCloseAltered() {
    onSponsorInfoModalClose();
    if (userInfo?.featureModalShown === false && userInfo?.currentSponsorId)
      onScoutAnnounceModalOpen();
  }

  const handleEntityClose = () => {
    setIsEntityModalOpen(false);
  };

  const getSponsorLatestActiveSlug = async () => {
    try {
      const slug = await axios.get('/api/listings/latest-active-slug');
      if (slug.data) {
        setLatestActiveSlug(slug.data.slug);
      }
    } catch (e) {
      console.log(e);
    }
  };

  // ENTITY NAME TO SPONSORS
  useEffect(() => {
    if (
      userInfo &&
      userInfo.currentSponsor &&
      userInfo.role !== 'GOD' &&
      !userInfo.currentSponsor.entityName
    ) {
      setIsEntityModalOpen(true);
    } else {
      setIsEntityModalOpen(false);
    }
  }, [userInfo]);

  useEffect(() => {
    const modalsToShow = async () => {
      if (
        userInfo?.currentSponsorId &&
        (!userInfo?.firstName || !userInfo?.lastName || !userInfo?.username)
      ) {
        onSponsorInfoModalOpen();
      } else if (
        userInfo?.featureModalShown === false &&
        userInfo?.currentSponsorId
      ) {
        await getSponsorLatestActiveSlug();
        onScoutAnnounceModalOpen();
        await axios.post('/api/user/update/', {
          featureModalShown: true,
        });
        setUserInfo({ ...userInfo, featureModalShown: true });
      }
    };
    modalsToShow();
  }, [userInfo]);

  if (!session && status === 'loading') {
    return <LoadingSection />;
  }

  if (!session && status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  const isHackathonRoute = router.asPath.startsWith('/dashboard/hackathon');

  const LinkItems: Array<LinkItemProps> = isHackathonRoute
    ? [
        { name: 'All Tracks', link: `/hackathon`, icon: MdList },
        {
          name: 'Get Help',
          link: 'https://t.me/pratikdholani',
          icon: MdOutlineChatBubbleOutline,
          posthog: 'get help_sponsor',
        },
      ]
    : [
        { name: 'My Listings', link: '/listings', icon: MdList },
        { name: 'Members', link: '/members', icon: MdOutlineGroup },
        {
          name: 'Get Help',
          link: 'https://t.me/pratikdholani',
          icon: MdOutlineChatBubbleOutline,
          posthog: 'get help_sponsor',
        },
      ];

  const NavItem = ({ icon, link, children, ...rest }: NavItemProps) => {
    const router = useRouter();
    const currentPath = router.asPath.split('?')[0];
    const isExternalLink = link?.startsWith('https://');
    const resolvedLink = isExternalLink ? link : `/dashboard${link}`;
    const isActiveLink = resolvedLink
      ? currentPath?.startsWith(resolvedLink)
      : false;

    return (
      <Link
        as={NextLink}
        _focus={{ boxShadow: 'none' }}
        href={resolvedLink}
        isExternal={isExternalLink}
        style={{ textDecoration: 'none' }}
      >
        <NavItemContent icon={icon} isActiveLink={isActiveLink} {...rest}>
          {children}
        </NavItemContent>
      </Link>
    );
  };

  const NavItemContent = ({ icon, isActiveLink, children, ...rest }: any) => (
    <Flex
      align="center"
      px={6}
      py={3}
      color={isActiveLink ? 'brand.purple' : 'brand.slate.500'}
      bg={isActiveLink ? '#EEF2FF' : 'transparent'}
      _hover={{
        bg: '#F5F8FF',
        color: 'brand.purple',
      }}
      cursor="pointer"
      role="group"
      {...rest}
    >
      {icon && (
        <Icon
          as={icon}
          mr="4"
          fontSize="16"
          _groupHover={{
            color: 'brand.purple',
          }}
        />
      )}
      {children}
    </Flex>
  );

  const showLoading = !isHackathonRoute
    ? !userInfo?.currentSponsor?.id
    : !userInfo?.hackathonId && session?.user?.role !== 'GOD';

  const showContent = isHackathonRoute
    ? userInfo?.hackathonId || session?.user?.role === 'GOD'
    : userInfo?.currentSponsor?.id;

  return (
    <Default
      className="bg-white"
      meta={
        <Meta
          title="Superteam Earn | Work to Earn in Crypto"
          description="Explore the latest bounties on Superteam Earn, offering opportunities in the crypto space across Design, Development, and Content."
          canonical="https://earn.superteam.fun"
        />
      }
    >
      <FeatureModal
        latestActiveBountySlug={latestActiveSlug}
        onClose={onScoutAnnounceModalClose}
        isOpen={isScoutAnnounceModalOpen}
      />
      <SponsorInfoModal
        onClose={sponsorInfoCloseAltered}
        isOpen={isSponsorInfoModalOpen}
      />
      <EntityNameModal isOpen={isEntityModalOpen} onClose={handleEntityClose} />
      <Flex display={{ base: 'flex', md: 'none' }} minH="80vh" px={3}>
        <Text
          align={'center'}
          pt={20}
          color={'brand.slate.500'}
          fontSize={'xl'}
          fontWeight={500}
        >
          The Sponsor Dashboard on Earn is not optimized for mobile yet. Please
          use a desktop to check out the Sponsor Dashboard
        </Text>
      </Flex>
      <Flex justify="start" display={{ base: 'none', md: 'flex' }} minH="100vh">
        <Box
          display={{ base: 'none', md: 'block' }}
          w={{ base: 0, md: 80 }}
          minH="100vh"
          pt={10}
          bg="white"
          borderRight={'1px solid'}
          borderRightColor={'blackAlpha.200'}
        >
          {session?.user?.role === 'GOD' && (
            <Box px={6} pb={6}>
              {isHackathonRoute ? <SelectHackathon /> : <SelectSponsor />}
            </Box>
          )}
          <CreateListingModal isOpen={isOpen} onClose={onClose} />
          <Flex align="center" justify="space-between" px={6} pb={6}>
            {!isHackathonRoute ? (
              <Button
                className="ph-no-capture"
                w="full"
                py={'22px'}
                fontSize="md"
                leftIcon={<AddIcon w={3} h={3} />}
                onClick={() => {
                  posthog.capture('create new listing_sponsor');
                  onOpen();
                }}
                variant="solid"
              >
                Create New Listing
              </Button>
            ) : (
              <Button
                as={NextLink}
                w="full"
                py={'22px'}
                fontSize="md"
                href={`/dashboard/hackathon/create-hackathon`}
                leftIcon={<AddIcon w={3} h={3} />}
                variant="solid"
              >
                Create New Track
              </Button>
            )}
          </Flex>
          {LinkItems.map((link) => (
            <NavItem
              onClick={() => {
                if (link.posthog) posthog.capture(link.posthog);
              }}
              className="ph-no-capture"
              key={link.name}
              link={link.link}
              icon={link.icon}
            >
              {link.name}
            </NavItem>
          ))}
        </Box>
        {showLoading && <LoadingSection />}
        {showContent && (
          <Box w="full" px={6} py={10} bg="white">
            {children}
          </Box>
        )}
      </Flex>
    </Default>
  );
}
