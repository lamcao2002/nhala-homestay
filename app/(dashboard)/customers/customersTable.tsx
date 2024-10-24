import { Card, Text } from '@mantine/core';
import { format } from 'date-fns';

export default function CustomesTable({ customers }: { customers: any[] }) {
  return (
    <>
      {customers?.map((customer, index) => (
        <Card key={index} radius="md" withBorder shadow="md" padding="lg" mb={'xs'}>
          <Text>
            <strong>Tên:</strong> {customer.customerName}
          </Text>
          <Text>
            <strong>SĐT:</strong> {customer.customerPhone}
          </Text>
          <Text>
            <strong>Check-in:</strong>{' '}
            {format(customer.checkin, 'dd/MM/yyyy HH:mm')}
          </Text>
          <Text>
            <strong>Check-out:</strong>{' '}
            {format(customer.checkout, 'dd/MM/yyyy HH:mm')}
          </Text>
        </Card>
      ))}
    </>
  );
}
