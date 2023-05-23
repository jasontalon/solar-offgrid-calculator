<template>
  <v-container class="pa-0">
    <v-row>
      <v-col cols='12'>
        <v-form v-model='valid'>
          <v-container>
            <v-row>
              <v-col>
                <v-text-field clearable label='Energy consumption per day' v-model='state.dailyEnergyConsumption'
                              :suffix='state.selectedDailyEnergyConsumptionUnitOfMeasure'></v-text-field>
              </v-col>
            </v-row>
            <v-row dense class='d-none'>
              <v-col>
                <v-radio-group
                    v-model='state.selectedDailyEnergyConsumptionUnitOfMeasure'
                    inline density='comfortable'>
                  <v-radio class='flex-grow-1' v-for='(item, index) in lookups.dailyEnergyConsumptionUnitOfMeasure'
                           :key='index'
                           :label='item.text'
                           :value='item.key'></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row dense=''>
              <v-col cols='6'>
                <v-select label='Battery type' :items='lookups.batteryTypes'
                          v-model='state.selectedBatteryType'></v-select>
              </v-col>
              <v-col cols='6'>
                <v-select label='Battery voltage' :items='lookups.batteryVoltages' suffix='v'
                          v-model='state.selectedBatteryVoltage'></v-select>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols='12' sm='4'>
                <v-text-field label='Average sun charge hours per day' type='number' v-model='state.sunHours'
                              suffix='Hours'></v-text-field>
              </v-col>
              <v-col cols='6' sm='4'>
                <v-text-field label='Inverter efficiency' type='number' v-model='state.inverterEfficiencyPercentage'
                              suffix='%'></v-text-field>
              </v-col>
              <v-col cols='6' sm='4'>
                <v-text-field label='Solar panel efficiency' type='number'
                              v-model='state.solarPanelEfficiencyPercentage'
                              suffix='%'></v-text-field>
              </v-col>
            </v-row>
            <v-row dense=''>
              <v-col>
                <v-checkbox v-model='state.shouldRoundUp' density='compact'
                            label='Round up the results'
                            persistent-hint
                            hint='This allows to provide a buffer and simplify the result'></v-checkbox>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-btn block color='green-darken-2' @click='compute'>Show Battery and solar capacity</v-btn>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn block>Clear</v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-col>
      <v-col cols='12'>
        <v-container>
          <v-row>
            <v-col cols='12'>
              <v-card>
                <template v-slot:title>
                  Battery requirements
                </template>
                <template v-slot:text>
                  You will need a battery with <strong>{{ state.selectedBatteryVoltage }} volts</strong> with
                  capacity of at least <strong>{{ state.minimumBatteryAmpereHour }} Ampere hour</strong>.
                </template>
              </v-card>

            </v-col>
            <v-col cols='12'>
              <v-card title='Solar Panel requirements'>
                <template v-slot:text>
                  You will need at least <strong>{{ state.minimumSolarPanelWatt }} watts</strong> of solar panels.
                </template>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import {reactive, watch, onMounted, computed} from 'vue'

const lookups = {
  batteryTypes: ['LiFePo4', 'Lead Acid']
  , batteryVoltages: [12, 24, 48]
  , presetBatteryDepthOfDischargePercentage: {'Lead Acid': 50, 'LiFePo4': 80}
  , dailyEnergyConsumptionUnitOfMeasure: [{key: 'kWh', text: 'kilowatt-hour'}, {key: 'Wh', text: 'watt-hour'}]
}

const state = reactive({
  selectedBatteryType: '',
  selectedBatteryVoltage: 0,
  selectedDailyEnergyConsumptionUnitOfMeasure: '',
  depthOfDischargePercentage: 0,
  inverterEfficiencyPercentage: 0,
  solarPanelEfficiencyPercentage: 0,
  sunHours: 0,
  roundUpToNearestHundred: 0,
  dailyEnergyConsumption: 0,
  dailyEnergyConsumptionWattHour: 0,
  dailyEnergyConsumptionWithInverter: 0,
  targetRoundUp: 0,

  overrideDepthOfDischargePercentage: false,
  overrideInverterEfficiencyPercentage: false,
  minimumBatteryAmpereHour: 0,
  batteryUsableCapacityWattHour: 0,
  batteryMaxCapacityWattHour: 0,
  minimumSolarPanelWatt: 0
})

onMounted(() => {
  state.selectedBatteryVoltage = lookups.batteryVoltages[2]
  state.selectedBatteryType = lookups.batteryTypes[0]
  state.inverterEfficiencyPercentage = 90
  state.solarPanelEfficiencyPercentage = 80
  state.selectedDailyEnergyConsumptionUnitOfMeasure = lookups.dailyEnergyConsumptionUnitOfMeasure[0].key
  state.sunHours = 4
  state.shouldRoundUp = true
  state.dailyEnergyConsumption = 2.4
})

watch(() => state.selectedBatteryType, (newValue) => {
  state.depthOfDischargePercentage = lookups.presetBatteryDepthOfDischargePercentage[newValue]
})

watch(() => state.dailyEnergyConsumption, (updatedDailyEnergyConsumption) => {
  state.dailyEnergyConsumptionWattHour = updatedDailyEnergyConsumption * (state.selectedDailyEnergyConsumptionUnitOfMeasure === 'kWh' ? 1000 : 1)
})

const valid = computed(() => {
  return true
})

const increaseValueByPercentage = (input, percent) => input + (input * percent / 100)
const getValueByPercentage = (input, percent) => input * percent / 100
const roundUp = (value, roundUpNearestValue) => {
  if (roundUpNearestValue)
    return Math.ceil(value / roundUpNearestValue) * roundUpNearestValue

  if (value < 500) return roundUp(value, 10)
  else if (value < 1000) return roundUp(value, 50)
  else return roundUp(value, 100)
}

const removeDecimal = value => Math.round(value)

const resolveRounding = (value, roundUpNearestValue) =>
    state.shouldRoundUp ? roundUp(value, roundUpNearestValue) : removeDecimal(value)

const compute = () => {
  state.dailyEnergyConsumptionWithInverter = resolveRounding(increaseValueByPercentage(state.dailyEnergyConsumptionWattHour, 100 - state.inverterEfficiencyPercentage))

  state.minimumBatteryAmpereHour = resolveRounding(state.dailyEnergyConsumptionWithInverter
      / getValueByPercentage(state.selectedBatteryVoltage, state.depthOfDischargePercentage))

  state.batteryMaxCapacityWattHour = state.selectedBatteryVoltage * state.minimumBatteryAmpereHour

  state.batteryUsableCapacityWattHour = getValueByPercentage(state.batteryMaxCapacityWattHour, state.depthOfDischargePercentage)

  state.minimumSolarPanelWatt = resolveRounding(getValueByPercentage(state.batteryUsableCapacityWattHour / state.sunHours, 100 - state.solarPanelEfficiencyPercentage))
}

</script>
