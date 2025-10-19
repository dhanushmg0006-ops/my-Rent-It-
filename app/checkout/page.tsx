import Container from "@/app/components/Container";
import Heading from "@/app/components/Heading";
import ClientOnly from "@/app/components/ClientOnly";

const CheckoutPage = () => {
  return (
    <ClientOnly>
      <Container>
        <div className="max-w-3xl mx-auto py-8">
          <Heading
            title="Checkout"
            subtitle="Complete your rental booking"
          />
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">
                Checkout functionality will be implemented here.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </ClientOnly>
  );
};

export default CheckoutPage;
