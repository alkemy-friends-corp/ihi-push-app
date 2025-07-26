'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card'
import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { Label } from '@/components/shadcn/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table'
import { Badge } from '@/components/shadcn/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/shadcn/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/select'

interface Device {
  id: string
  name: string
  type: 'mobile' | 'desktop' | 'tablet'
  status: 'active' | 'inactive' | 'maintenance'
  lastSeen: string
  userId: string
}

export default function DeviceManagerComponent() {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'iPhone 14 Pro',
      type: 'mobile',
      status: 'active',
      lastSeen: '2024-01-15 10:30:00',
      userId: 'user1'
    },
    {
      id: '2',
      name: 'MacBook Pro',
      type: 'desktop',
      status: 'active',
      lastSeen: '2024-01-15 09:15:00',
      userId: 'user2'
    },
    {
      id: '3',
      name: 'iPad Air',
      type: 'tablet',
      status: 'inactive',
      lastSeen: '2024-01-14 16:45:00',
      userId: 'user1'
    }
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: 'mobile' as 'mobile' | 'desktop' | 'tablet',
    userId: ''
  })

  const getStatusBadge = (status: Device['status']) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    }
    return <Badge className={variants[status]}>{status}</Badge>
  }

  const getTypeIcon = (type: Device['type']) => {
    const icons = {
      mobile: '📱',
      desktop: '💻',
      tablet: '📱'
    }
    return icons[type]
  }

  const handleAddDevice = () => {
    if (newDevice.name && newDevice.userId) {
      const device: Device = {
        id: Date.now().toString(),
        name: newDevice.name,
        type: newDevice.type,
        status: 'active',
        lastSeen: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userId: newDevice.userId
      }
      setDevices([...devices, device])
      setNewDevice({ name: '', type: 'mobile', userId: '' })
      setIsAddDialogOpen(false)
    }
  }

  const handleDeleteDevice = (id: string) => {
    setDevices(devices.filter(device => device.id !== id))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Device Manager</h1>
          <p className="text-gray-600 mt-2">Manage and monitor connected devices</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black hover:bg-gray-800 text-white">
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
              <DialogDescription>
                Add a new device to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="device-name">Device Name</Label>
                <Input
                  id="device-name"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  placeholder="Enter device name"
                />
              </div>
              <div>
                <Label htmlFor="device-type">Device Type</Label>
                <Select value={newDevice.type} onValueChange={(value: 'mobile' | 'desktop' | 'tablet') => setNewDevice({ ...newDevice, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="user-id">User ID</Label>
                <Input
                  id="user-id"
                  value={newDevice.userId}
                  onChange={(e) => setNewDevice({ ...newDevice, userId: e.target.value })}
                  placeholder="Enter user ID"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDevice} className="bg-black hover:bg-gray-800 text-white">
                Add Device
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{devices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {devices.filter(d => d.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inactive Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">
              {devices.filter(d => d.status === 'inactive').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Device List</CardTitle>
          <CardDescription>
            All registered devices in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{getTypeIcon(device.type)}</span>
                      <span className="capitalize">{device.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(device.status)}</TableCell>
                  <TableCell>{device.userId}</TableCell>
                  <TableCell>{device.lastSeen}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDevice(device.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 