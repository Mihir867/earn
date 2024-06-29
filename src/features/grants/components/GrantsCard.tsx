import { Flex, Image, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import { tokenList } from '@/constants';
import { formatNumberWithSuffix } from '@/utils/formatNumberWithSuffix';

import type { GrantWithApplicationCount } from '../types';
import { grantAmount } from '../utils';

export const GrantsCard = ({ grant }: { grant: GrantWithApplicationCount }) => {
  const router = useRouter();

  const {
    sponsor,
    slug,
    title,
    minReward,
    maxReward,
    token,
    totalApproved,
    _count,
  } = grant;

  const sponsorLogo = sponsor?.logo
    ? sponsor.logo.replace('/upload/', '/upload/c_scale,w_128,h_128,f_auto/')
    : `${router.basePath}/assets/logo/sponsor-logo.png`;

  const tokenIcon = tokenList.find((ele) => ele.tokenSymbol === token)?.icon;

  return (
    <Link
      as={NextLink}
      w="full"
      px={{ base: 2, sm: 4 }}
      py={4}
      borderRadius={5}
      _hover={{ textDecoration: 'none', bg: 'gray.100' }}
      href={`/grants/${slug}`}
    >
      <Flex
        align="center"
        justify="space-between"
        w={{ base: '100%', md: 'brand.120' }}
      >
        <Flex w="100%">
          <Image
            w={{ base: 14, sm: 16 }}
            h={{ base: 14, sm: 16 }}
            mr={{ base: 3, sm: 5 }}
            alt={sponsor?.name}
            rounded={5}
            src={sponsorLogo}
          />
          <Flex justify="space-between" direction="column" w="full">
            <Text
              color="brand.slate.700"
              fontSize={['sm', 'sm', 'md', 'md']}
              fontWeight={600}
              _hover={{ textDecoration: 'underline' }}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {title}
            </Text>
            <Text
              w="full"
              color="brand.slate.500"
              fontSize={{ md: 'sm', base: 'xs' }}
            >
              {sponsor?.name}
            </Text>
            <Flex align="center" gap={{ base: 1, sm: 3 }} mt="1px">
              <>
                <Flex
                  align="center"
                  justify="start"
                  gap={1}
                  display={{ base: 'flex', sm: 'none' }}
                >
                  <Image
                    display="flex"
                    h={{ base: 3, sm: 4 }}
                    alt={token}
                    src={tokenIcon}
                  />
                  <Flex align="baseline" gap={0.5}>
                    <Text
                      color="brand.slate.600"
                      fontSize="xs"
                      fontWeight="600"
                      whiteSpace="nowrap"
                    >
                      {grantAmount({
                        maxReward: maxReward!,
                        minReward: minReward!,
                      })}
                    </Text>
                    <Text color="gray.400" fontSize="xs" fontWeight={500}>
                      {token}
                    </Text>
                  </Flex>
                  <Text
                    ml={1}
                    color="brand.slate.300"
                    fontSize={['xx-small', 'xs', 'sm', 'sm']}
                  >
                    |
                  </Text>
                </Flex>
                <Flex align="center" gap={1}>
                  <Image
                    display="flex"
                    h={{ base: 3, sm: 4 }}
                    alt={'grant'}
                    src={'/assets/icons/bank.svg'}
                  />
                  <Text
                    display="flex"
                    color="gray.500"
                    fontSize={['x-small', 'xs', 'xs', 'xs']}
                    fontWeight={500}
                  >
                    Grant
                  </Text>
                </Flex>
              </>
              <Text
                display="flex"
                color="brand.slate.300"
                fontSize={['xx-small', 'xs', 'sm', 'sm']}
              >
                |
              </Text>
              <Flex align="center" gap={1}>
                <Text
                  color="gray.500"
                  fontSize={['x-small', '0.71875rem']}
                  fontWeight={500}
                  whiteSpace="nowrap"
                >
                  $
                  {formatNumberWithSuffix(
                    totalApproved / _count.GrantApplication,
                  ) || 0}{' '}
                  <Text
                    as="span"
                    sx={{
                      wordSpacing: '-0.09rem',
                    }}
                    ml={0.3}
                    color="gray.400"
                    fontSize={['x-small', '0.6875rem']}
                  >
                    Avg. Grant
                  </Text>
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex
          align="center"
          justify="start"
          display={{ base: 'none', sm: 'flex' }}
          mr={3}
        >
          <Image
            w={4}
            h={4}
            mr={1}
            alt={token}
            rounded="full"
            src={tokenIcon}
          />
          <Flex align="baseline" gap={1}>
            <Text
              color="brand.slate.600"
              fontSize={['xs', 'xs', 'md', 'md']}
              fontWeight="600"
              whiteSpace="nowrap"
            >
              {grantAmount({
                maxReward: maxReward!,
                minReward: minReward!,
              })}
            </Text>
            <Text
              color="gray.400"
              fontSize={['xs', 'xs', 'md', 'md']}
              fontWeight={500}
            >
              {token}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Link>
  );
};
