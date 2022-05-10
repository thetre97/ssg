export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  /** The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID. */
  ID: string;
  /** The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text. */
  String: string;
  Boolean: boolean;
  /** The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. */
  Int: number;
  /** The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
  Float: number;
};

export type LokiFiltersInput = {
  eq?: InputMaybe<Scalars['String']>;
  ne?: InputMaybe<Scalars['String']>;
};

export type Post = {
  __typename?: 'Post';
  id?: Maybe<Scalars['Float']>;
  title?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['Float']>;
  date?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  post?: Maybe<Post>;
  allPosts?: Maybe<Array<Maybe<Post>>>;
};


export type QueryPostArgs = {
  path?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryAllPostsArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  filter?: InputMaybe<PostFilterInput>;
};

export type PostFilterInput = {
  id?: InputMaybe<LokiFiltersInput>;
  title?: InputMaybe<LokiFiltersInput>;
  slug?: InputMaybe<LokiFiltersInput>;
  date?: InputMaybe<LokiFiltersInput>;
  path?: InputMaybe<LokiFiltersInput>;
};
