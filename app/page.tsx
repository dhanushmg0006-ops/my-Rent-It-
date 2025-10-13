import Container from "@/app/components/Container";
import ListingCard from "@/app/components/listings/ListingCard";
import EmptyState from "@/app/components/EmptyState";
import Button from "@/app/components/Button";
import useRentModal from "@/app/hooks/useRentModal";

import getListings, { 
  IListingsParams
} from "@/app/actions/getListings";
import getCurrentUser from "@/app/actions/getCurrentUser";
import ClientOnly from "./components/ClientOnly";
import QuoteStrip from "@/app/components/home/QuoteStrip";
import HeroCarousel from "@/app/components/home/HeroCarousel";
import OfferStrip from "@/app/components/home/OfferStrip";
import DealsRail from "@/app/components/home/DealsRail";
 

interface HomeProps {
  searchParams: IListingsParams
};

const Home = async ({ searchParams }: HomeProps) => {
  const listings = await getListings(searchParams);
  const currentUser = await getCurrentUser();

  if (listings.length === 0) {
    return (
      <ClientOnly>
        <EmptyState showReset />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Spacer for fixed navbar */}
        <div className="h-32"></div>
        <Container>
          {/* Hero Section */}
          <HeroCarousel />

          {/* Category Offers Strip */}
          <OfferStrip />

          {/* Featured Deals */}
          <DealsRail items={listings.slice(0, 10)} />

          {/* Brand Philosophy */}
          <QuoteStrip />

          {/* Featured Categories Section */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                🏆 Featured Categories
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Discover amazing items across all categories - from electronics to experiences
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {[
                { name: 'Electronics', icon: '📱', count: '2,500+', color: 'from-blue-500 to-purple-600' },
                { name: 'Cameras', icon: '📷', count: '850+', color: 'from-green-500 to-teal-600' },
                { name: 'Gaming', icon: '🎮', count: '1,200+', color: 'from-red-500 to-pink-600' },
                { name: 'Sports', icon: '⚽', count: '680+', color: 'from-orange-500 to-yellow-600' },
                { name: 'Fashion', icon: '👕', count: '3,100+', color: 'from-pink-500 to-rose-600' },
                { name: 'Books', icon: '📚', count: '1,800+', color: 'from-indigo-500 to-blue-600' },
              ].map((category) => (
                <div key={category.name} className="group cursor-pointer">
                  <div className={`bg-gradient-to-br ${category.color} rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300`}>
                    <div className="text-4xl mb-3 group-hover:animate-bounce">{category.icon}</div>
                    <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.count} items</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* All Listings Grid */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
                  🎯 All Available Items
                </h2>
                <p className="text-gray-600">
                  {listings.length} premium items available for rent
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select className="bg-transparent text-sm font-medium text-gray-900 border-none outline-none">
                  <option>Popular</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>

            {listings.length > 0 ? (
              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  md:grid-cols-3
                  lg:grid-cols-4
                  xl:grid-cols-5
                  2xl:grid-cols-6
                  gap-6 md:gap-8
                "
              >
                {listings.map((listing: any) => (
                  <ListingCard
                    currentUser={currentUser}
                    key={listing.id}
                    data={listing}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </section>
        </Container>
      </div>
    </ClientOnly>
  )
}

export default Home;
